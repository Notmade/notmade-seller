"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError, fmtDate, netAfterCommission, type Category, type OptionImage, type Product } from "../../lib/seller-api";
import { WHO_SHIPS_LABEL, type FulfilmentMode } from "../../lib/rate-card";
import { CHANGE_LABEL, MAX_PRODUCT_PHOTOS, formSource, hasPendingChange, isApproved, movePhoto, photoPayload, photosChanged, type PhotoItem } from "../../lib/product-change";
import { listingRate } from "../../lib/rate-card";
import { productPrice, productPriceFields } from "../../lib/currency";
import { featureOn } from "../../lib/features";
import { deleteDraft, listDrafts, type ListingDraft } from "../../lib/listing-drafts";
import { STATUS_LABEL, productStatus } from "../../lib/product-status";
import ValueGallery from "../../components/ValueGallery";
import CategoryPicker from "../../components/CategoryPicker";
import { useDashboardSeller, useSellerCurrency } from "../seller-context";
import { Alert, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, PageSkeleton, PriceInput, RED } from "../../components/portal-ui";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MAX_IMAGES = MAX_PRODUCT_PHOTOS; // 8 per product, on create and edit (backend)
const MAX_BYTES = 8 * 1024 * 1024;

type Filter = "all" | "draft" | "live" | "pending" | "rejected" | "changes";
const FILTER_LABEL: Record<Filter, string> = { all: "All", draft: STATUS_LABEL.draft, live: STATUS_LABEL.live, pending: STATUS_LABEL.pending, rejected: STATUS_LABEL.rejected, changes: "Changes pending" };
const FILTERS = Object.keys(FILTER_LABEL) as Filter[];

export default function ProductsPage() {
  // Adding / editing waits for the updated agreement; delete and orders are unaffected
  const me = useDashboardSeller();
  const locked = !!me.agreement?.resign_required;
  const { country, fmt } = useSellerCurrency();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [drafts, setDrafts] = useState<ListingDraft[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const routerRef = useRef(useRouter());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setProducts((await api.products()).products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load products");
    }
  }, []);

  useEffect(() => {
    void load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1" && !locked) routerRef.current.replace("/dashboard/products/new");
    setSubmitted(params.get("submitted") === "1");
    void listDrafts(me.id).then(setDrafts);
    api.categories().then(r => setCategories(r.categories)).catch(() => { /* form shows empty dropdown */ });
  }, [load, locked, me.id]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products ?? [])
      .filter(p => filter === "all" || (filter === "changes" ? hasPendingChange(p) : productStatus(p).key === filter))
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [products, filter, query]);

  const replace = (saved: Product) => setProducts(ps => (ps ?? []).map(p => (p.id === saved.id ? saved : p)));

  /** Withdraws the waiting change; the live listing is not touched. */
  const cancelChange = async (id: string) => {
    setCancelling(id); setError(""); setNotice("");
    try {
      replace((await api.cancelPendingChange(id)).product);
      setNotice("Change cancelled. Your live listing is unchanged.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel the change");
    } finally {
      setCancelling(null);
    }
  };

  const remove = async (id: string) => {
    setDeleting(true);
    try {
      await api.deleteProduct(id);
      setProducts(ps => (ps ?? []).filter(p => p.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Catalogue" sub="New products are reviewed before they go live. Edits to a live product wait for approval while the live version stays on sale. Stock changes apply at once."
        action={(
          <div className="sp-inline">
            <Link href="/dashboard/products/bulk" className="sp-btn-line">Bulk upload</Link>
            {locked ? <Button variant="secondary" disabled>Add photos</Button> : <Link href="/dashboard/products/photos" className="sp-btn-line">Add photos</Link>}
            {locked ? <Button disabled>+ Add product</Button> : <Link href="/dashboard/products/new" className="sp-btn-red">+ Add product</Link>}
          </div>
        )} />

      {submitted && <div style={{ marginBottom: 14 }}><Alert kind="success"><strong>Product submitted, in review.</strong> NOTMADE reviews each product before it goes live.</Alert></div>}

      {locked && (
        <div style={{ marginBottom: 14 }}>
          <Alert kind="warn">
            Sign the updated agreement to add or edit products. Your live products stay live.{" "}
            <Link href="/dashboard/agreement" style={{ color: RED, fontWeight: 700 }}>Review &amp; sign</Link>
          </Alert>
        </div>
      )}

      {error && <div style={{ marginBottom: 14 }}><Alert>{error}</Alert></div>}
      {notice && <div style={{ marginBottom: 14 }}><Alert kind="success">{notice}</Alert></div>}

      {drafts.length > 0 && (filter === "all" || filter === "draft") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
          {drafts.map(d => (
            <Card key={d.id} style={{ padding: 14 }}>
              <div className="sp-draft-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>{d.listing.name.trim() || "Untitled product"}</p>
                    <Badge status="draft" label={STATUS_LABEL.draft} />
                  </div>
                  <p style={{ fontSize: 12, color: "#777", marginTop: 2 }}>On this device · saved {fmtDate(d.savedAt)}</p>
                </div>
                <div className="sp-inline">
                  <Link href={`/dashboard/products/new?draft=${d.id}`} className="sp-btn-line">Continue</Link>
                  <Button variant="danger" onClick={() => { void deleteDraft(d.id); setDrafts(ds => ds.filter(x => x.id !== d.id)); }}>Discard</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!products ? (!error && <PageSkeleton stats={0} />) : products.length === 0 ? (
        !drafts.length && <EmptyState title="No products yet" sub="List your first product in a few guided steps, or upload many at once with a CSV."
          action={locked ? <Button disabled>+ Add product</Button> : <Link href="/dashboard/products/new" className="sp-btn-red">+ Add your first product</Link>} />
      ) : (
        <>
          <div className="sp-toolbar">
            <input className="sp-search" placeholder={featureOn("sku") ? "Search name or SKU" : "Search by name"} aria-label="Search catalogue" value={query} onChange={e => setQuery(e.target.value)} />
            <div className="sp-pills" role="group" aria-label="Status filter">
              {FILTERS.map(f => (
                <button key={f} type="button" className="sp-pill" aria-pressed={filter === f} onClick={() => setFilter(f)}>{FILTER_LABEL[f]}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.length === 0 && !(filter === "draft" && drafts.length) && (
              <EmptyState title={query ? "No products match that search." : `No products in ${FILTER_LABEL[filter]}.`}
                action={<Button variant="secondary" onClick={() => { setFilter("all"); setQuery(""); }}>Show all products</Button>} />
            )}
            {shown.map(p => {
              const st = productStatus(p);
              const { price, mrp } = productPrice(p, country);
              return (
                <Card key={p.id} style={{ padding: 14 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", background: "#F3F3F3", flexShrink: 0 }}>
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#111111" }}>{p.name}</p>
                        <Badge status={st.key} label={st.label} />
                      </div>
                      <p style={{ fontSize: 13, color: "#777777", marginTop: 4 }}>
                        {price ? fmt(price) : "No price set"}
                        {mrp && price && mrp > price ? (
                          <span style={{ textDecoration: "line-through", color: "#AAAAAA", marginLeft: 6 }}>{fmt(mrp)}</span>
                        ) : null}
                        {p.sku && <>{" · "}SKU {p.sku}</>}
                        {" · "}{p.category ?? "Uncategorised"}{" · "}Stock {p.stock ?? 0}
                        {p.sizes && p.sizes.length > 0 && ` (${p.sizes.join(", ")})`}
                      </p>
                      <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 2 }}>Submitted {fmtDate(p.submitted_at ?? p.created_at)}</p>
                      {p.approval_status === "rejected" && p.rejection_reason && (
                        <p style={{ fontSize: 13, color: RED, marginTop: 6 }}>What to change: {p.rejection_reason}</p>
                      )}
                      <ChangeLine product={p} busy={cancelling === p.id} onCancel={() => void cancelChange(p.id)} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {confirmDelete === p.id ? (
                        <>
                          <Button variant="ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>Cancel</Button>
                          <Button variant="danger" onClick={() => void remove(p.id)} disabled={deleting}>{deleting ? "Deleting…" : "Confirm delete"}</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="secondary" disabled={locked} onClick={() => setEditing(p)}>Edit</Button>
                          <Button variant="danger" onClick={() => setConfirmDelete(p.id)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {editing && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={(saved, message) => {
            replace(saved);
            setNotice(message);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/** The latest change to an approved product: waiting (with Cancel), approved, or not approved with the reason. */
function ChangeLine({ product, busy, onCancel }: { product: Product; busy: boolean; onCancel: () => void }) {
  const pc = product.pending_change;
  if (!pc) return null;
  const kind = pc.status === "pending" ? "pending" : pc.status === "rejected" ? "rejected" : "live";
  const rejected = pc.fields.filter(f => pc.decisions?.[f] === "rejected");
  return (
    <div className="sp-change" data-status={pc.status} style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: pc.status === "rejected" ? "rgba(204,0,0,0.05)" : "#F7F7F7", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <Badge status={kind} label={CHANGE_LABEL[pc.status]} />
      <span style={{ fontSize: 12, color: "#555555", flex: 1, minWidth: 160 }}>
        {pc.labels.join(", ")}{pc.status === "pending" ? ` · sent ${fmtDate(pc.submitted_at)} · customers see the live version until it is approved` : ` · ${fmtDate(pc.reviewed_at)}`}
        {pc.rejection_reason && <><br /><span style={{ color: RED }}>{rejected.length && rejected.length < pc.fields.length ? "Not approved: " : "Reason: "}{pc.rejection_reason}</span></>}
      </span>
      {pc.status === "pending" && <Button variant="ghost" onClick={onCancel} disabled={busy}>{busy ? "Cancelling…" : "Cancel change"}</Button>}
    </div>
  );
}

// ─── Create / edit form ───────────────────────────────────────────────────────

interface SizeRow { size: string; stock: string }
interface ExtraOption { name: string; values: { value: string; images: OptionImage[] }[] }

const OPTION_SUGGESTIONS = ["Colour", "Style", "Material", "Pattern", "Finish"];
const isSizeName = (n: string) => n.trim().toLowerCase() === "size";
const comboKey = (value: string, size: string | null) => `${value}\u0000${size ?? ""}`;

function ProductForm({ product: original, categories, onClose, onSaved }: {
  product: Product | null; categories: Category[]; onClose: () => void; onSaved: (p: Product, message: string) => void;
}) {
  const seller = useDashboardSeller();
  const { country, fmt } = useSellerCurrency();
  const isEdit = !!original;
  // Edits build on a change that is already waiting, so nothing the seller sent before is lost
  const product = original ? formSource(original) : null;
  const approved = !!original && isApproved(original);
  const waiting = !!original && hasPendingChange(original);
  const initialPrice = product ? productPrice(product, country) : { price: null, mrp: null };

  const initialSizes: SizeRow[] = product?.sizes?.length
    ? product.sizes.map(s => ({ size: s, stock: String(product.product_variants?.find(v => v.size === s)?.stock ?? 0) }))
    : [];

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(initialPrice.price ? String(initialPrice.price) : "");
  const [mrp, setMrp] = useState(initialPrice.mrp ? String(initialPrice.mrp) : "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [hasSizes, setHasSizes] = useState(initialSizes.length > 0 || !product);
  const [sizes, setSizes] = useState<SizeRow[]>(initialSizes.length ? initialSizes : [{ size: "M", stock: "" }]);
  const [customSize, setCustomSize] = useState("");
  const [stock, setStock] = useState(product && !initialSizes.length ? String(product.stock ?? 0) : "");
  // Second option (Colour, Style, …): values, a photo gallery per value, stock per value × size
  const extraInit = product?.options?.find(o => !isSizeName(o.name)) ?? null;
  const [extra, setExtra] = useState<ExtraOption | null>(extraInit ? {
    name: extraInit.name,
    values: extraInit.values.map(v => ({ value: v.value, images: v.images?.length ? v.images : v.image_url ? [{ url: v.image_url, jpg_url: v.image_jpg_url ?? null }] : [] })),
  } : null);
  const [newValue, setNewValue] = useState("");
  const [comboStock, setComboStock] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (extraInit) for (const v of product?.variants ?? []) {
      const val = v.option_values?.[extraInit.name];
      if (val) out[comboKey(val, v.option_values?.Size ?? null)] = String(v.stock ?? 0);
    }
    return out;
  });
  const extraActive = !!extra;
  // UAE-based sellers can list once their signed agreement is on file (backend: isUaeReady)
  const agreementMissing = country === "AE" && !seller.uae?.ready;
  const pct = listingRate(seller, categories.find(c => c.id === categoryId));
  const initialImages = product?.images ?? [];
  const [photos, setPhotos] = useState<PhotoItem[]>(() => initialImages.map(url => ({ kind: "url" as const, url })));
  const [drag, setDrag] = useState<number | null>(null);
  const [sizeFit, setSizeFit] = useState(product?.size_and_fit ?? "");
  const [whoShips, setWhoShips] = useState<FulfilmentMode | "">(product?.fulfilment_mode ?? "");
  // Photo per SKU (variant), for products with an extra option: keyed like comboStock
  const [skuImage, setSkuImage] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (extraInit) for (const v of product?.variants ?? []) {
      const val = v.option_values?.[extraInit.name];
      if (val && v.image_url) out[comboKey(val, v.option_values?.Size ?? null)] = v.image_url;
    }
    return out;
  });
  const [skuBusy, setSkuBusy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const category = categories.find(c => c.id === categoryId);

  // Object URLs of picked files are released when the form closes
  const previewsRef = useRef<string[]>([]);
  useEffect(() => () => previewsRef.current.forEach(u => URL.revokeObjectURL(u)), []);

  const totalImages = photos.length;

  const pickImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const tooBig = files.find(f => f.size > MAX_BYTES);
    if (tooBig) { setError(`${tooBig.name} is larger than 8 MB`); return; }
    const room = MAX_IMAGES - photos.length;
    if (files.length > room) setError(`You can add ${Math.max(room, 0)} more photo(s). Max ${MAX_IMAGES} per product.`);
    else setError("");
    const added = files.slice(0, Math.max(room, 0)).map(file => {
      const preview = URL.createObjectURL(file);
      previewsRef.current.push(preview);
      return { kind: "file" as const, file, preview };
    });
    setPhotos(prev => [...prev, ...added]);
  };

  const pickSkuImage = async (key: string, file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Use JPG, PNG or WEBP"); return; }
    if (file.size > MAX_BYTES) { setError(`${file.name} is larger than 8 MB`); return; }
    setSkuBusy(key); setError("");
    try {
      const r = await api.uploadVariantImage(file, product?.id);
      setSkuImage(m => ({ ...m, [key]: r.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSkuBusy(null);
    }
  };

  const toggleSize = (s: string) => {
    setSizes(prev => prev.some(r => r.size === s) ? prev.filter(r => r.size !== s) : [...prev, { size: s, stock: "" }]);
  };

  const addCustomSize = () => {
    const s = customSize.trim().slice(0, 20);
    if (s && !sizes.some(r => r.size === s)) setSizes(prev => [...prev, { size: s, stock: "" }]);
    setCustomSize("");
  };

  const submit = async (e: FormEvent) => { e.preventDefault(); await save(); };

  const save = async () => {
    setError("");
    if (totalImages === 0) { setError("Add at least one image"); return; }
    if (totalImages > MAX_IMAGES) { setError(`Max ${MAX_IMAGES} photos per product`); return; }
    if (hasSizes && sizes.length === 0) { setError("Add at least one size, or switch off sizes"); return; }
    if (extra && (!extra.name.trim() || isSizeName(extra.name))) { setError("Name the extra option, e.g. Colour"); return; }
    if (extra && !extra.values.length) { setError(`Add at least one ${extra.name || "option"} value, or remove the option`); return; }

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    fd.append("category_id", categoryId);
    fd.append("size_and_fit", sizeFit.trim());
    if (category?.fulfilment_mode_applies && whoShips) fd.append("fulfilment_mode", whoShips);
    if (featureOn("sku")) fd.append("sku", sku.trim());
    for (const [k, v] of Object.entries(productPriceFields(country, price, mrp))) fd.append(k, v);
    if (extra) {
      // Options mode: Size (if any) + the extra option; one variant per value × size, ids kept on edit
      const name = extra.name.trim();
      const options = [
        ...(hasSizes ? [{ name: "Size", values: sizes.map(r => ({ value: r.size })) }] : []),
        { name, values: extra.values.map(v => ({ value: v.value, images: v.images })) },
      ];
      const sizeList: (string | null)[] = hasSizes ? sizes.map(r => r.size) : [null];
      const variants = extra.values.flatMap(v => sizeList.map(sz => {
        const option_values: Record<string, string> = { [name]: v.value, ...(sz ? { Size: sz } : {}) };
        const prev = product?.variants?.find(x => x.option_values?.[name] === v.value && (x.option_values?.Size ?? null) === sz);
        const k = comboKey(v.value, sz);
        return {
          ...(prev ? { id: prev.id } : {}), ...(prev?.sku ? { sku: prev.sku } : {}),
          option_values, stock: Number(comboStock[k] || 0), image_url: skuImage[k] ?? null,
        };
      }));
      fd.append("options", JSON.stringify(options));
      fd.append("variants", JSON.stringify(variants));
    } else if (hasSizes) {
      fd.append("sizes", JSON.stringify(sizes.map(r => r.size)));
      fd.append("stock_by_size", JSON.stringify(Object.fromEntries(sizes.map(r => [r.size, Number(r.stock || 0)]))));
    } else {
      fd.append("sizes", "[]");
      fd.append("stock", stock || "0");
    }
    // Photos go only when they changed. A new order alone is a change too, and new photos keep their place
    const { existing, files } = photoPayload(photos);
    if (!isEdit || photosChanged(initialImages, photos)) {
      if (isEdit) fd.append("existing_images", JSON.stringify(existing));
      files.forEach(f => fd.append("images", f));
    }

    setSaving(true);
    try {
      if (isEdit) {
        const res = await api.updateProduct(original!.id, fd);
        onSaved(res.product, res.pending_fields?.length
          ? "Saved and sent for approval. Your product stays live as it is until NOTMADE approves the change."
          : res.stock_updated ? "Stock updated. It is live now." : "Saved. Nothing needed approval.");
      } else {
        const res = await api.createProduct(fd);
        onSaved(res.product, "Product submitted, in review.");
      }
    } catch (err) {
      const list = err instanceof ApiError && Array.isArray(err.data.errors) ? (err.data.errors as string[]) : null;
      setError(list && list.length > 1 ? list.join(" · ") : err instanceof Error ? err.message : "Could not save product");
      setSaving(false);
    }
  };

  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 };

  return (
    <Modal title={isEdit ? "Edit product" : "Add product"} onClose={saving ? () => undefined : onClose} width={720}>
      <form ref={formRef} onSubmit={submit}>
        <fieldset disabled={saving} style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {approved && (
            <Alert kind={waiting ? "warn" : "info"}>
              {waiting
                ? <>A change is waiting for approval ({original!.pending_change!.labels.join(", ")}). You are editing on top of it; saving replaces it. Customers keep seeing the live version.</>
                : <>Your product stays live as it is while NOTMADE reviews your change. Stock changes apply at once. Price, photos and every other change wait for approval.</>}
            </Alert>
          )}
          {isEdit && !approved && original?.approval_status === "rejected" && (
            <Alert kind="warn">Saving sends this product back for review.</Alert>
          )}

          <Field label="Product name" htmlFor="p-name">
            <input id="p-name" className="field-input" value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={200} />
          </Field>
          <Field label="Description" htmlFor="p-desc" hint="Materials, fit, care — at least 10 characters.">
            <textarea id="p-desc" className="field-input" rows={4} value={description} onChange={e => setDescription(e.target.value)} required minLength={10} maxLength={5000} />
          </Field>
          <Field label="Category" htmlFor="p-cat">
            <CategoryPicker id="p-cat" categories={categories} value={categoryId} onChange={setCategoryId} />
          </Field>
          {featureOn("sku") && (
            <Field label="Your product ID / SKU (optional)" htmlFor="p-sku" hint="Your own reference. Shoppers don't see it.">
              <input id="p-sku" className="field-input" value={sku} onChange={e => setSku(e.target.value)} maxLength={64} autoComplete="off" />
            </Field>
          )}

          {agreementMissing && <Alert kind="warn">Products can be listed once your seller agreement is on file.</Alert>}

          <div style={grid2}>
            <Field label="Selling price" htmlFor="p-price">
              <PriceInput id="p-price" country={country} value={price} onChange={setPrice} required />
              {pct !== null && Number(price) > 0 && (
                <p aria-live="polite" style={{ fontSize: 13, color: "#16A34A", fontWeight: 600, marginTop: 6 }}>
                  You receive {fmt(netAfterCommission(Number(price), pct))} after {pct}% commission
                </p>
              )}
            </Field>
            <Field label="MRP (optional)" htmlFor="p-mrp" hint="Shown struck-through if higher than price">
              <PriceInput id="p-mrp" country={country} value={mrp} onChange={setMrp} min={price || "1"} />
            </Field>
          </div>

          <Field label="Size and fit (optional)" htmlFor="p-fit" hint="For example: Oversized. Model is 6 ft and wears M.">
            <textarea id="p-fit" className="field-input" rows={2} value={sizeFit} onChange={e => setSizeFit(e.target.value)} maxLength={1000} />
          </Field>
          {category?.fulfilment_mode_applies && (
            <Field label="Who ships" htmlFor="p-ships">
              <select id="p-ships" className="field-input" value={whoShips} onChange={e => setWhoShips(e.target.value as FulfilmentMode)} required>
                <option value="" disabled>Choose</option>
                {(Object.keys(WHO_SHIPS_LABEL) as FulfilmentMode[]).map(m => <option key={m} value={m}>{WHO_SHIPS_LABEL[m]}</option>)}
              </select>
            </Field>
          )}

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#333333", cursor: "pointer", marginBottom: 10 }}>
              <input type="checkbox" checked={hasSizes} onChange={e => setHasSizes(e.target.checked)} style={{ width: 18, height: 18, accentColor: RED }} />
              This product comes in sizes
            </label>
            {hasSizes ? (
              <div style={{ border: "1px solid #EEEEEE", borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {PRESET_SIZES.map(s => {
                    const on = sizes.some(r => r.size === s);
                    return (
                      <button key={s} type="button" onClick={() => toggleSize(s)} aria-pressed={on} style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        border: `1.5px solid ${on ? RED : "#E0E0E0"}`, background: on ? "rgba(204,0,0,0.06)" : "#FFFFFF", color: on ? RED : "#555555",
                      }}>{s}</button>
                    );
                  })}
                  <input className="field-input" value={customSize} placeholder="Other (e.g. 32, Free)" maxLength={20}
                    onChange={e => setCustomSize(e.target.value)} style={{ width: 170, padding: "6px 10px", fontSize: 13 }}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); } }} />
                  <Button variant="secondary" onClick={addCustomSize} style={{ padding: "6px 12px" }}>Add</Button>
                </div>
                {!extraActive && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                  {sizes.map(r => (
                    <Field key={r.size} label={`Stock · ${r.size}`} htmlFor={`stock-${r.size}`}>
                      <input id={`stock-${r.size}`} className="field-input" type="number" min="0" step="1" max="100000" required value={r.stock}
                        onChange={e => setSizes(prev => prev.map(x => x.size === r.size ? { ...x, stock: e.target.value } : x))} />
                    </Field>
                  ))}
                </div>}
              </div>
            ) : extraActive ? null : (
              <Field label="Stock" htmlFor="p-stock">
                <input id="p-stock" className="field-input" type="number" min="0" step="1" max="100000" value={stock} onChange={e => setStock(e.target.value)} required style={{ maxWidth: 200 }} />
              </Field>
            )}
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#333333", cursor: "pointer", marginBottom: 10 }}>
              <input type="checkbox" checked={extraActive} onChange={e => setExtra(e.target.checked ? { name: "Colour", values: [] } : null)} style={{ width: 18, height: 18, accentColor: RED }} />
              This product has another option (colour, style, material…)
            </label>
            {extra && (
              <div style={{ border: "1px solid #EEEEEE", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={grid2}>
                  <Field label="Option name" htmlFor="p-opt" hint="Shoppers pick this on the product page">
                    <input id="p-opt" className="field-input" list="p-opt-list" value={extra.name} maxLength={30} required
                      onChange={e => setExtra(x => x && ({ ...x, name: e.target.value }))} />
                    <datalist id="p-opt-list">{OPTION_SUGGESTIONS.map(o => <option key={o} value={o} />)}</datalist>
                  </Field>
                  <Field label={`Add ${extra.name.toLowerCase() || "value"}`} htmlFor="p-optval" hint="Press Enter to add">
                    <input id="p-optval" className="field-input" value={newValue} maxLength={50} placeholder="e.g. Black"
                      onChange={e => setNewValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        const v = newValue.trim();
                        if (v && !extra.values.some(x => x.value.toLowerCase() === v.toLowerCase())) setExtra(x => x && ({ ...x, values: [...x.values, { value: v, images: [] }] }));
                        setNewValue("");
                      }} />
                  </Field>
                </div>

                {extra.values.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: 12, color: "#777777" }}>Photos per {extra.name.toLowerCase() || "value"} (optional, up to 8 each, drag to reorder). The product page switches to these when a shopper picks it.</p>
                    {extra.values.map(v => (
                      <div key={v.value} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <ValueGallery label={v.value} images={v.images} productId={product?.id}
                            onChange={imgs => setExtra(x => x && ({ ...x, values: x.values.map(y => y.value === v.value ? { ...y, images: imgs } : y) }))} />
                        </div>
                        <button type="button" aria-label={`Remove ${v.value}`} onClick={() => setExtra(x => x && ({ ...x, values: x.values.filter(y => y.value !== v.value) }))}
                          style={{ border: "none", background: "transparent", color: "#999999", fontSize: 18, cursor: "pointer" }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {extra.values.length > 0 && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#333333", marginBottom: 8 }}>Stock and SKU photo</p>
                    <p style={{ fontSize: 12, color: "#777777", marginBottom: 8 }}>Optional: one photo for a single SKU (for example Black · M). Shoppers see it when they pick that SKU.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                      {extra.values.flatMap(v => (hasSizes ? sizes.map(r => r.size) : [null]).map(sz => {
                        const k = comboKey(v.value, sz);
                        const id = `stock-${v.value}-${sz ?? "one"}`;
                        return (
                          <Field key={k} label={sz ? `${v.value} · ${sz}` : v.value} htmlFor={id}>
                            <input id={id} className="field-input" type="number" min="0" step="1" max="100000" value={comboStock[k] ?? ""} required
                              onChange={e => setComboStock(m => ({ ...m, [k]: e.target.value }))} />
                            <SkuPhoto label={sz ? `${v.value} ${sz}` : v.value} url={skuImage[k] ?? null} busy={skuBusy === k}
                              onPick={f => void pickSkuImage(k, f)} onRemove={() => setSkuImage(m => { const n = { ...m }; delete n[k]; return n; })} />
                          </Field>
                        );
                      }))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Field label={`Photos (${totalImages}/${MAX_IMAGES})`} hint="JPG, PNG or WEBP, up to 8 MB each. The first photo is the cover. Drag, or use the arrows, to change the order.">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }} role="list" aria-label="Product photos">
              {photos.map((it, i) => (
                <Thumb key={it.kind === "url" ? it.url : it.preview} src={it.kind === "url" ? it.url : it.preview} isNew={it.kind === "file"}
                  index={i} count={photos.length} dragging={drag === i}
                  onDragStart={() => setDrag(i)} onDrop={() => { if (drag !== null) setPhotos(p => movePhoto(p, drag, i)); setDrag(null); }}
                  onMove={to => setPhotos(p => movePhoto(p, i, to))}
                  onRemove={() => setPhotos(p => p.filter((_, j) => j !== i))} />
              ))}
              {totalImages < MAX_IMAGES && (
                <label style={{
                  width: 124, height: 148, borderRadius: 10, border: "1.5px dashed #CCCCCC", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", color: "#888888", fontSize: 24,
                }}>
                  +
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pickImages} />
                </label>
              )}
            </div>
          </Field>

          {error && <Alert>{error}</Alert>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{saving ? "Saving…" : approved ? "Save & send for approval" : isEdit ? "Save & submit for review" : "Submit for review"}</Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

function Thumb({ src, onRemove, isNew = false, index, count, dragging, onDragStart, onDrop, onMove }: {
  src: string; onRemove: () => void; isNew?: boolean; index: number; count: number; dragging: boolean;
  onDragStart: () => void; onDrop: () => void; onMove: (to: number) => void;
}) {
  // Controls sit under the photo, 40px each, so they are easy to tap on a phone
  const ctl: React.CSSProperties = { width: 40, height: 40, flexShrink: 0, border: "none", background: "transparent", color: "#555555", cursor: "pointer", fontSize: 18, padding: 0, fontFamily: "inherit" };
  return (
    <div role="listitem" draggable onDragStart={onDragStart} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onDrop(); }}
      aria-label={`Photo ${index + 1} of ${count}${index === 0 ? ", cover" : ""}`}
      style={{ width: 124, borderRadius: 10, overflow: "hidden", background: "#FFFFFF", cursor: "grab", opacity: dragging ? 0.4 : 1, border: index === 0 ? `2px solid ${RED}` : isNew ? `1.5px solid ${RED}` : "1px solid #EEEEEE" }}>
      <div style={{ position: "relative", width: "100%", height: 104, background: "#F3F3F3" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
        {index === 0 && <span style={{ position: "absolute", top: 4, left: 4, background: RED, color: "#FFFFFF", fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 4 }}>COVER</span>}
        {isNew && <span style={{ position: "absolute", top: 4, right: 4, background: "#FFFFFF", color: RED, fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 4 }}>NEW</span>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} aria-label={`Move photo ${index + 1} left`} style={{ ...ctl, opacity: index === 0 ? 0.3 : 1 }}>‹</button>
        <button type="button" onClick={onRemove} aria-label={`Remove photo ${index + 1}`} style={{ ...ctl, color: RED }}>×</button>
        <button type="button" onClick={() => onMove(index + 1)} disabled={index === count - 1} aria-label={`Move photo ${index + 1} right`} style={{ ...ctl, opacity: index === count - 1 ? 0.3 : 1 }}>›</button>
      </div>
    </div>
  );
}

/** One optional photo for one SKU (variant). Uploaded at once; it reaches shoppers when the product's change is approved. */
function SkuPhoto({ label, url, busy, onPick, onRemove }: { label: string; url: string | null; busy: boolean; onPick: (f: File | undefined) => void; onRemove: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`Photo for ${label}`} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
          <button type="button" onClick={onRemove} aria-label={`Remove photo for ${label}`} style={{ border: "none", background: "transparent", color: "#999999", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Remove</button>
        </>
      ) : (
        <button type="button" onClick={() => input.current?.click()} disabled={busy} aria-label={`Add photo for ${label}`}
          style={{ border: "1px dashed #CCCCCC", background: "#FFFFFF", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 700, color: "#777777", cursor: busy ? "wait" : "pointer", fontFamily: "inherit" }}>
          {busy ? "Uploading…" : "+ SKU photo"}
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { onPick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
