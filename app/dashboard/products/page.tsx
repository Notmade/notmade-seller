"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { api, ApiError, fmtDate, isNotLive, netAfterCommission, type Category, type OptionImage, type Product } from "../../lib/seller-api";
import { productPrice, productPriceFields } from "../../lib/currency";
import { featureOn } from "../../lib/features";
import ValueGallery from "../../components/ValueGallery";
import CategoryPicker from "../../components/CategoryPicker";
import { useDashboardSeller, useSellerCurrency } from "../seller-context";
import { Alert, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, PageSkeleton, PriceInput, RED } from "../../components/portal-ui";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MAX_IMAGES = 10;      // per product (backend)
const MAX_UPLOAD = 8;       // per request (backend)
const MAX_BYTES = 8 * 1024 * 1024;

type Filter = "all" | "draft" | "live" | "pending" | "rejected";
const FILTER_LABEL: Record<Filter, string> = { all: "All", draft: "Draft", live: "Live", pending: "In review", rejected: "Rejected" };
const filters = () => (Object.keys(FILTER_LABEL) as Filter[]).filter(f => f !== "draft" || featureOn("drafts"));

function productStatus(p: Product): { key: string; label: string } {
  if (p.status === "draft") return { key: "draft", label: "Draft" };
  if (p.approval_status === "rejected") return { key: "rejected", label: "Rejected" };
  if (p.approval_status === "pending") return { key: "pending", label: "In review" };
  if (p.is_live) return { key: "live", label: "Live" };
  return { key: "approved", label: "Approved · not live" };
}

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
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setProducts((await api.products()).products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load products");
    }
  }, []);

  useEffect(() => {
    void load();
    if (new URLSearchParams(window.location.search).get("new") === "1" && !locked) setEditing("new");
    api.categories().then(r => setCategories(r.categories)).catch(() => { /* form shows empty dropdown */ });
  }, [load, locked]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products ?? [])
      .filter(p => filter === "all" || productStatus(p).key === filter)
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [products, filter, query]);

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
      <PageHeader title="Catalogue" sub="New products and edits go to NOTMADE for review before going live."
        action={<Button disabled={locked} onClick={() => setEditing("new")}>+ Add product</Button>} />

      {locked && (
        <div style={{ marginBottom: 14 }}>
          <Alert kind="warn">
            Sign the updated agreement to add or edit products. Your live products stay live.{" "}
            <Link href="/dashboard/agreement" style={{ color: RED, fontWeight: 700 }}>Review &amp; sign</Link>
          </Alert>
        </div>
      )}

      {error && <div style={{ marginBottom: 14 }}><Alert>{error}</Alert></div>}

      {!products ? (!error && <PageSkeleton stats={0} />) : products.length === 0 ? (
        <EmptyState title="No products yet" sub="Add your first product to start selling on NOTMADE."
          action={<Button disabled={locked} onClick={() => setEditing("new")}>+ Add product</Button>} />
      ) : (
        <>
          <div className="sp-toolbar">
            <input className="sp-search" placeholder={featureOn("sku") ? "Search name or SKU" : "Search by name"} aria-label="Search catalogue" value={query} onChange={e => setQuery(e.target.value)} />
            <div className="sp-pills" role="group" aria-label="Status filter">
              {filters().map(f => (
                <button key={f} type="button" className="sp-pill" aria-pressed={filter === f} onClick={() => setFilter(f)}>{FILTER_LABEL[f]}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.length === 0 && <p style={{ fontSize: 14, color: "#888888", padding: "20px 0" }}>Nothing here.</p>}
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
                        <p style={{ fontSize: 13, color: RED, marginTop: 6 }}>Reason: {p.rejection_reason}</p>
                      )}
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
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={saved => {
            setProducts(ps => {
              const rest = (ps ?? []).filter(p => p.id !== saved.id);
              return [saved, ...rest];
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Create / edit form ───────────────────────────────────────────────────────

interface SizeRow { size: string; stock: string }
interface ExtraOption { name: string; values: { value: string; images: OptionImage[] }[] }

const OPTION_SUGGESTIONS = ["Colour", "Style", "Material", "Pattern", "Finish"];
const isSizeName = (n: string) => n.trim().toLowerCase() === "size";
const comboKey = (value: string, size: string | null) => `${value}\u0000${size ?? ""}`;

function ProductForm({ product, categories, onClose, onSaved }: {
  product: Product | null; categories: Category[]; onClose: () => void; onSaved: (p: Product) => void;
}) {
  const seller = useDashboardSeller();
  const { country, fmt } = useSellerCurrency();
  const isEdit = !!product;
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
  const indiaPct = country === "IN" ? seller.commission?.india_pct ?? null : null;
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const urls = newImages.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [newImages]);

  const totalImages = existingImages.length + newImages.length;

  const pickImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const tooBig = files.find(f => f.size > MAX_BYTES);
    if (tooBig) { setError(`${tooBig.name} is larger than 8 MB`); return; }
    const room = Math.min(MAX_UPLOAD - newImages.length, MAX_IMAGES - existingImages.length - newImages.length);
    if (files.length > room) setError(`You can add ${Math.max(room, 0)} more image(s) — max ${MAX_IMAGES} per product, ${MAX_UPLOAD} per save.`);
    else setError("");
    setNewImages(prev => [...prev, ...files.slice(0, Math.max(room, 0))]);
  };

  const toggleSize = (s: string) => {
    setSizes(prev => prev.some(r => r.size === s) ? prev.filter(r => r.size !== s) : [...prev, { size: s, stock: "" }]);
  };

  const addCustomSize = () => {
    const s = customSize.trim().slice(0, 20);
    if (s && !sizes.some(r => r.size === s)) setSizes(prev => [...prev, { size: s, stock: "" }]);
    setCustomSize("");
  };

  const submit = async (e: FormEvent) => { e.preventDefault(); await save(false); };

  /** Draft: POST /seller/products/drafts, so a backend without drafts can never submit it for review. */
  const save = async (draft: boolean) => {
    setError("");
    if (draft && !(formRef.current?.reportValidity() ?? true)) return;
    if (totalImages === 0) { setError("Add at least one image"); return; }
    if (hasSizes && sizes.length === 0) { setError("Add at least one size, or switch off sizes"); return; }
    if (extra && (!extra.name.trim() || isSizeName(extra.name))) { setError("Name the extra option, e.g. Colour"); return; }
    if (extra && !extra.values.length) { setError(`Add at least one ${extra.name || "option"} value, or remove the option`); return; }

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    fd.append("category_id", categoryId);
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
        return { ...(prev ? { id: prev.id } : {}), option_values, stock: Number(comboStock[comboKey(v.value, sz)] || 0) };
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
    // Only touch images on edit when they actually changed, so unchanged products skip re-conversion
    const imagesChanged = !isEdit || newImages.length > 0 || existingImages.length !== (product?.images?.length ?? 0);
    if (isEdit && imagesChanged) fd.append("existing_images", JSON.stringify(existingImages));
    newImages.forEach(f => fd.append("images", f));

    setSaving(true);
    try {
      const res = draft ? await api.saveDraft(fd) : isEdit ? await api.updateProduct(product!.id, fd) : await api.createProduct(fd);
      onSaved(res.product);
    } catch (err) {
      if (draft && isNotLive(err)) {
        setError("Drafts are not switched on yet. Nothing was saved or submitted.");
        setSaving(false);
        return;
      }
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
          {isEdit && product?.approval_status !== "pending" && (
            <Alert kind="warn">Saving changes sends this product back for review{product?.is_live ? " and takes it offline until approved" : ""}.</Alert>
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
              {indiaPct !== null && Number(price) > 0 && (
                <p aria-live="polite" style={{ fontSize: 13, color: "#16A34A", fontWeight: 600, marginTop: 6 }}>
                  You receive {fmt(netAfterCommission(Number(price), indiaPct))} after {indiaPct}% commission
                </p>
              )}
            </Field>
            <Field label="MRP (optional)" htmlFor="p-mrp" hint="Shown struck-through if higher than price">
              <PriceInput id="p-mrp" country={country} value={mrp} onChange={setMrp} min={price || "1"} />
            </Field>
          </div>

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
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#333333", marginBottom: 8 }}>Stock</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                      {extra.values.flatMap(v => (hasSizes ? sizes.map(r => r.size) : [null]).map(sz => {
                        const k = comboKey(v.value, sz);
                        const id = `stock-${v.value}-${sz ?? "one"}`;
                        return (
                          <Field key={k} label={sz ? `${v.value} · ${sz}` : v.value} htmlFor={id}>
                            <input id={id} className="field-input" type="number" min="0" step="1" max="100000" value={comboStock[k] ?? ""} required
                              onChange={e => setComboStock(m => ({ ...m, [k]: e.target.value }))} />
                          </Field>
                        );
                      }))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Field label={`Images (${totalImages}/${MAX_IMAGES})`} hint="JPG, PNG or WEBP, up to 8 MB each. The first image is the cover.">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {existingImages.map(url => (
                <Thumb key={url} src={url} onRemove={() => setExistingImages(prev => prev.filter(u => u !== url))} />
              ))}
              {previews.map((url, i) => (
                <Thumb key={url} src={url} onRemove={() => setNewImages(prev => prev.filter((_, j) => j !== i))} isNew />
              ))}
              {totalImages < MAX_IMAGES && newImages.length < MAX_UPLOAD && (
                <label style={{
                  width: 84, height: 84, borderRadius: 10, border: "1.5px dashed #CCCCCC", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", color: "#888888", fontSize: 24,
                }}>
                  +
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pickImages} />
                </label>
              )}
            </div>
          </Field>

          {error && <Alert>{error}</Alert>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            {featureOn("drafts") && (!isEdit || product?.status === "draft") && <Button variant="secondary" disabled={saving} onClick={() => void save(true)}>Save as draft</Button>}
            <Button type="submit">{saving ? "Saving…" : isEdit && product?.status !== "draft" ? "Save & submit for review" : "Submit for review"}</Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

function Thumb({ src, onRemove, isNew = false }: { src: string; onRemove: () => void; isNew?: boolean }) {
  return (
    <div style={{ position: "relative", width: 84, height: 84, borderRadius: 10, overflow: "hidden", background: "#F3F3F3", border: isNew ? `1.5px solid ${RED}` : "1px solid #EEEEEE" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <button type="button" onClick={onRemove} aria-label="Remove image" style={{
        position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", border: "none",
        background: "rgba(0,0,0,0.6)", color: "#FFFFFF", cursor: "pointer", fontSize: 14, lineHeight: "22px", padding: 0,
      }}>×</button>
    </div>
  );
}
