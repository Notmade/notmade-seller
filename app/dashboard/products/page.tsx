"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { api, ApiError, inr, fmtDate, type Category, type Product } from "../../lib/seller-api";
import { useDashboardSeller } from "../seller-context";
import { Alert, Badge, Button, Card, EmptyState, Field, FullPageSpinner, Modal, PageHeader, RED } from "../../components/portal-ui";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MAX_IMAGES = 10;      // per product (backend)
const MAX_UPLOAD = 8;       // per request (backend)
const MAX_BYTES = 8 * 1024 * 1024;

type Filter = "all" | "live" | "pending" | "rejected";

function productStatus(p: Product): { key: string; label: string } {
  if (p.approval_status === "rejected") return { key: "rejected", label: "Rejected" };
  if (p.approval_status === "pending") return { key: "pending", label: "In review" };
  if (p.is_live) return { key: "live", label: "Live" };
  return { key: "approved", label: "Approved · not live" };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
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
    api.categories().then(r => setCategories(r.categories)).catch(() => { /* form shows empty dropdown */ });
  }, [load]);

  const shown = useMemo(() => (products ?? []).filter(p => {
    const k = productStatus(p).key;
    return filter === "all" || (filter === "pending" ? k === "pending" : filter === "live" ? k === "live" : k === "rejected");
  }), [products, filter]);

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
      <PageHeader title="Products" sub="New products and edits go to NOTMADE for review before going live."
        action={<Button onClick={() => setEditing("new")}>+ Add product</Button>} />

      {error && <div style={{ marginBottom: 14 }}><Alert>{error}</Alert></div>}

      {!products ? (!error && <FullPageSpinner />) : products.length === 0 ? (
        <EmptyState title="No products yet" sub="Add your first product to start selling on NOTMADE."
          action={<Button onClick={() => setEditing("new")}>+ Add product</Button>} />
      ) : (
        <>
          <div role="tablist" style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {(["all", "live", "pending", "rejected"] as Filter[]).map(f => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} style={{
                padding: "7px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                border: `1.5px solid ${filter === f ? "#111111" : "#E0E0E0"}`,
                background: filter === f ? "#111111" : "#FFFFFF", color: filter === f ? "#FFFFFF" : "#555555",
              }}>
                {f === "pending" ? "In review" : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.length === 0 && <p style={{ fontSize: 14, color: "#888888", padding: "20px 0" }}>Nothing here.</p>}
            {shown.map(p => {
              const st = productStatus(p);
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
                        {inr(p.price_inr)}
                        {p.original_price_inr && p.original_price_inr > p.price_inr && (
                          <span style={{ textDecoration: "line-through", color: "#AAAAAA", marginLeft: 6 }}>{inr(p.original_price_inr)}</span>
                        )}
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
                          <Button variant="secondary" onClick={() => setEditing(p)}>Edit</Button>
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

function ProductForm({ product, categories, onClose, onSaved }: {
  product: Product | null; categories: Category[]; onClose: () => void; onSaved: (p: Product) => void;
}) {
  const seller = useDashboardSeller();
  const isEdit = !!product;

  const initialSizes: SizeRow[] = product?.sizes?.length
    ? product.sizes.map(s => ({ size: s, stock: String(product.product_variants?.find(v => v.size === s)?.stock ?? 0) }))
    : [];

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(product ? String(product.price_inr) : "");
  const [mrp, setMrp] = useState(product?.original_price_inr ? String(product.original_price_inr) : "");
  const [hasSizes, setHasSizes] = useState(initialSizes.length > 0 || !product);
  const [sizes, setSizes] = useState<SizeRow[]>(initialSizes.length ? initialSizes : [{ size: "M", stock: "" }]);
  const [customSize, setCustomSize] = useState("");
  const [stock, setStock] = useState(product && !initialSizes.length ? String(product.stock ?? 0) : "");
  const [sellInUae, setSellInUae] = useState(!!product?.sell_in_uae);
  const [priceAed, setPriceAed] = useState(product?.price_aed ? String(product.price_aed) : "");
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (totalImages === 0) { setError("Add at least one image"); return; }
    if (hasSizes && sizes.length === 0) { setError("Add at least one size, or switch off sizes"); return; }

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("description", description.trim());
    fd.append("category_id", categoryId);
    fd.append("price_inr", price);
    fd.append("mrp", mrp);
    if (hasSizes) {
      fd.append("sizes", JSON.stringify(sizes.map(r => r.size)));
      fd.append("stock_by_size", JSON.stringify(Object.fromEntries(sizes.map(r => [r.size, Number(r.stock || 0)]))));
    } else {
      fd.append("sizes", "[]");
      fd.append("stock", stock || "0");
    }
    if (seller.sell_in_uae) {
      fd.append("sell_in_uae", String(sellInUae));
      if (sellInUae) fd.append("price_aed", priceAed);
    }
    // Only touch images on edit when they actually changed, so unchanged products skip re-conversion
    const imagesChanged = !isEdit || newImages.length > 0 || existingImages.length !== (product?.images?.length ?? 0);
    if (isEdit && imagesChanged) fd.append("existing_images", JSON.stringify(existingImages));
    newImages.forEach(f => fd.append("images", f));

    setSaving(true);
    try {
      const res = isEdit ? await api.updateProduct(product!.id, fd) : await api.createProduct(fd);
      onSaved(res.product);
    } catch (err) {
      const list = err instanceof ApiError && Array.isArray(err.data.errors) ? (err.data.errors as string[]) : null;
      setError(list && list.length > 1 ? list.join(" · ") : err instanceof Error ? err.message : "Could not save product");
      setSaving(false);
    }
  };

  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 };

  return (
    <Modal title={isEdit ? "Edit product" : "Add product"} onClose={saving ? () => undefined : onClose} width={720}>
      <form onSubmit={submit}>
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
            <select id="p-cat" className="field-input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <div style={grid2}>
            <Field label="Selling price (₹)" htmlFor="p-price">
              <input id="p-price" className="field-input" type="number" min="1" step="0.01" max="1000000" value={price} onChange={e => setPrice(e.target.value)} required />
            </Field>
            <Field label="MRP (₹, optional)" htmlFor="p-mrp" hint="Shown struck-through if higher than price">
              <input id="p-mrp" className="field-input" type="number" min={price || "1"} step="0.01" max="1000000" value={mrp} onChange={e => setMrp(e.target.value)} />
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                  {sizes.map(r => (
                    <Field key={r.size} label={`Stock · ${r.size}`} htmlFor={`stock-${r.size}`}>
                      <input id={`stock-${r.size}`} className="field-input" type="number" min="0" step="1" max="100000" required value={r.stock}
                        onChange={e => setSizes(prev => prev.map(x => x.size === r.size ? { ...x, stock: e.target.value } : x))} />
                    </Field>
                  ))}
                </div>
              </div>
            ) : (
              <Field label="Stock" htmlFor="p-stock">
                <input id="p-stock" className="field-input" type="number" min="0" step="1" max="100000" value={stock} onChange={e => setStock(e.target.value)} required style={{ maxWidth: 200 }} />
              </Field>
            )}
          </div>

          {seller.sell_in_uae && (
            <div style={grid2}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#333333", cursor: "pointer" }}>
                <input type="checkbox" checked={sellInUae} onChange={e => setSellInUae(e.target.checked)} style={{ width: 18, height: 18, accentColor: RED }} />
                Also sell in the UAE
              </label>
              {sellInUae && (
                <Field label="UAE price (AED)" htmlFor="p-aed">
                  <input id="p-aed" className="field-input" type="number" min="1" step="0.01" max="1000000" value={priceAed} onChange={e => setPriceAed(e.target.value)} required />
                </Field>
              )}
            </div>
          )}

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
            <Button type="submit">{saving ? "Saving…" : isEdit ? "Save & submit for review" : "Submit for review"}</Button>
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
