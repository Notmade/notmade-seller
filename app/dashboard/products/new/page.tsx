"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, netAfterCommission, type Category } from "../../../lib/seller-api";
import { listingRate } from "../../../lib/rate-card";
import { draftsAvailable, deleteDraft, getDraft, saveDraft } from "../../../lib/listing-drafts";
import {
  EMPTY_LISTING, MAX_PHOTO_BYTES, MAX_PHOTOS, listingFormData, stepError, stockCombos, totalStock, type Listing, type WizardStep,
} from "../../../lib/product-listing";
import { useDashboardSeller, useSellerCurrency } from "../../seller-context";
import CategoryPicker from "../../../components/CategoryPicker";
import ValueGallery from "../../../components/ValueGallery";
import { Alert, Badge, Button, Card, Field, PageHeader, PageSkeleton, PriceInput } from "../../../components/portal-ui";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const LABEL: Record<WizardStep, string> = {
  category: "Category", photos: "Photos", details: "Title and description", variants: "Sizes, colours and stock",
  price: "Price", shipping: "Shipping", review: "Review and submit",
};
const newId = () => `d-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function NewProductPage() {
  return <Suspense fallback={<PageSkeleton stats={0} />}><Wizard /></Suspense>;
}

function Wizard() {
  const router = useRouter();
  const params = useSearchParams();
  const seller = useDashboardSeller();
  const { country, currency, fmt } = useSellerCurrency();
  const locked = !!seller.agreement?.resign_required || (country === "AE" && !seller.uae?.ready);

  const [categories, setCategories] = useState<Category[] | null>(null);
  const [listing, setListing] = useState<Listing>(EMPTY_LISTING);
  const [photos, setPhotos] = useState<File[]>([]);
  const [draftId, setDraftId] = useState(newId);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  const draftParam = params.get("draft");
  useEffect(() => {
    api.categories().then((r) => setCategories(r.categories)).catch(() => setCategories([]));
    if (!draftParam) return;
    void getDraft(draftParam, seller.id).then((d) => {
      if (!d) return;
      setListing(d.listing); setPhotos(d.photos); setDraftId(d.id);
    });
  }, [draftParam, seller.id]);

  const category = categories?.find((c) => c.id === listing.categoryId);
  const pct = listingRate(seller, category, listing.fulfilmentMode);
  // Who ships exists only where the backend says so; anywhere else it answers FULFILMENT_MODE_NOT_APPLICABLE
  const steps = useMemo<WizardStep[]>(() => [
    "category", "photos", "details", "variants", "price", ...(category?.fulfilment_mode_applies ? ["shipping" as const] : []), "review",
  ], [category?.fulfilment_mode_applies]);
  const current = steps[Math.min(step, steps.length - 1)];

  const patch = (p: Partial<Listing>) => { setListing((l) => ({ ...l, ...p })); setError(""); setNote(""); };
  const pickCategory = (id: string) => {
    const applies = categories?.find((c) => c.id === id)?.fulfilment_mode_applies;
    patch({ categoryId: id, fulfilmentMode: applies ? listing.fulfilmentMode : null });
  };

  const go = (to: number) => {
    setStep(to); setError(""); setNote("");
    requestAnimationFrame(() => heading.current?.focus());
  };
  const next = () => {
    const bad = stepError(current, listing, photos.length);
    if (bad) setError(bad); else go(step + 1);
  };

  const save = async () => {
    const ok = await saveDraft({ id: draftId, sellerId: seller.id, listing, photos, savedAt: new Date().toISOString() });
    setError(ok ? "" : "This browser could not save a draft. Nothing was lost on this page.");
    setNote(ok ? "Draft saved on this device. It is private to you and has not been sent to NOTMADE." : "");
  };

  const submit = async () => {
    for (const s of steps) {
      const bad = stepError(s, listing, photos.length);
      if (bad) { setStep(steps.indexOf(s)); setError(bad); return; }
    }
    setSaving(true); setError("");
    try {
      await api.createProduct(listingFormData(listing, country, photos));
      await deleteDraft(draftId);
      router.push("/dashboard/products?submitted=1");
    } catch (err) {
      const list = err instanceof ApiError && Array.isArray(err.data.errors) ? (err.data.errors as string[]) : null;
      setError(list && list.length > 1 ? list.join(" · ") : err instanceof Error ? err.message : "Could not submit this product");
      setSaving(false);
    }
  };

  if (locked) {
    return (
      <div>
        <PageHeader title="Add a product" />
        <Alert kind="warn">Sign your seller agreement to add products. <Link href="/dashboard/agreement" style={{ color: "#CC0000", fontWeight: 700 }}>Review and sign</Link></Alert>
      </div>
    );
  }
  if (!categories) return <PageSkeleton stats={0} />;

  return (
    <div className="sp-wiz">
      <PageHeader title="Add a product" sub="Nothing goes live until NOTMADE has reviewed it."
        action={<Link href="/dashboard/products/bulk" className="sp-link">Upload many with a CSV</Link>} />

      <ol className="sp-wiz-steps" aria-label="Steps">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className={i < step ? "done" : ""}>
            <button type="button" disabled={i > step} onClick={() => go(i)}>
              <span aria-hidden>{i + 1}</span><em>{LABEL[s]}</em>
            </button>
          </li>
        ))}
      </ol>

      <div className="sp-wiz-grid">
        <Card style={{ minWidth: 0 }}>
          <h2 ref={heading} tabIndex={-1} className="sp-wiz-h">Step {step + 1} of {steps.length}: {LABEL[current]}</h2>

          {current === "category" && (
            <Field label="Category" htmlFor="w-cat" hint="Search, or browse the groups. This sets the fields you see next.">
              <CategoryPicker id="w-cat" categories={categories} value={listing.categoryId} onChange={pickCategory} />
            </Field>
          )}
          {current === "photos" && <Photos photos={photos} onChange={(f) => { setPhotos(f); setError(""); }} onError={setError} />}
          {current === "details" && (
            <div className="sp-stack">
              <Field label="Product title" htmlFor="w-name"><input id="w-name" className="field-input" value={listing.name} maxLength={200} onChange={(e) => patch({ name: e.target.value })} /></Field>
              <Field label="Description" htmlFor="w-desc" hint="Materials, fit, care. At least 10 characters.">
                <textarea id="w-desc" className="field-input" rows={6} value={listing.description} maxLength={5000} onChange={(e) => patch({ description: e.target.value })} />
              </Field>
            </div>
          )}
          {current === "variants" && <Variants l={listing} patch={patch} />}
          {current === "price" && (
            <div className="sp-stack">
              <Field label={`Selling price (${currency})`} htmlFor="w-price">
                <PriceInput id="w-price" country={country} value={listing.price} onChange={(v) => patch({ price: v })} />
                {pct != null && Number(listing.price) > 0 && (
                  <p aria-live="polite" className="sp-good">You receive {fmt(netAfterCommission(Number(listing.price), pct))} after {pct}% commission</p>
                )}
              </Field>
              <Field label="MRP (optional)" htmlFor="w-mrp" hint="Shown struck through when it is higher than the price.">
                <PriceInput id="w-mrp" country={country} value={listing.mrp} onChange={(v) => patch({ mrp: v })} />
              </Field>
            </div>
          )}
          {current === "shipping" && (
            <fieldset className="sp-choice">
              <legend>Who ships this product?</legend>
              {([["notmade_ships", "NOTMADE ships", "NOTMADE collects it from you after you mark the order ready."],
                ["seller_ships", "I ship it", "You send it with your own courier and enter the tracking."]] as const).map(([v, t, d]) => (
                <label key={v}><input type="radio" name="w-ship" checked={listing.fulfilmentMode === v} onChange={() => patch({ fulfilmentMode: v })} /><span><strong>{t}</strong><small>{d}</small></span></label>
              ))}
            </fieldset>
          )}
          {current === "review" && (
            <div className="sp-stack">
              <dl className="sp-review">
                <div><dt>Category</dt><dd>{category?.name ?? "—"}</dd></div>
                <div><dt>Photos</dt><dd>{photos.length}</dd></div>
                <div><dt>Variants</dt><dd>{[listing.hasSizes && `${listing.sizes.length} sizes`, listing.option && `${listing.option.values.length} ${listing.option.name.toLowerCase()}`].filter(Boolean).join(", ") || "None"}</dd></div>
                <div><dt>Stock</dt><dd>{totalStock(listing)}</dd></div>
                <div><dt>Price</dt><dd>{fmt(Number(listing.price))}</dd></div>
              </dl>
              <Alert kind="info">After you submit, this product shows as In review. NOTMADE approves it before it goes live.</Alert>
            </div>
          )}

          {error && <div style={{ marginTop: 14 }}><Alert>{error}</Alert></div>}
          {note && <div style={{ marginTop: 14 }}><Alert kind="success">{note}</Alert></div>}

          <div className="sp-wiz-foot">
            {step > 0 && <Button variant="secondary" disabled={saving} onClick={() => go(step - 1)}>Back</Button>}
            {draftsAvailable() && <Button variant="ghost" disabled={saving} onClick={() => void save()}>Save draft</Button>}
            {current === "review"
              ? <Button disabled={saving} onClick={() => void submit()}>{saving ? "Submitting…" : "Submit for review"}</Button>
              : <Button onClick={next}>Continue</Button>}
          </div>
        </Card>

        <Preview listing={listing} photos={photos} categoryName={category?.name} price={Number(listing.price) > 0 ? fmt(Number(listing.price)) : null}
          mrp={Number(listing.mrp) > Number(listing.price) ? fmt(Number(listing.mrp)) : null} />
      </div>
    </div>
  );
}

function Photos({ photos, onChange, onError }: { photos: File[]; onChange: (f: File[]) => void; onError: (m: string) => void }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);

  useEffect(() => {
    const u = photos.map((f) => URL.createObjectURL(f));
    setUrls(u);
    return () => u.forEach((x) => URL.revokeObjectURL(x));
  }, [photos]);

  const add = (files: File[]) => {
    const images = files.filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    if (images.length < files.length) { onError("Photos must be JPG, PNG or WEBP."); return; }
    const big = images.find((f) => f.size > MAX_PHOTO_BYTES);
    if (big) { onError(`${big.name} is larger than 8 MB.`); return; }
    const room = MAX_PHOTOS - photos.length;
    if (images.length > room) onError(`You can add ${room} more. Up to ${MAX_PHOTOS} photos per product.`);
    onChange([...photos, ...images.slice(0, Math.max(room, 0))]);
  };
  const pick = (e: ChangeEvent<HTMLInputElement>) => { add(Array.from(e.target.files ?? [])); e.target.value = ""; };
  const drop = (e: DragEvent) => { e.preventDefault(); setOver(false); add(Array.from(e.dataTransfer.files)); };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    next.splice(to, 0, ...next.splice(from, 1));
    onChange(next);
  };

  return (
    <div className="sp-stack">
      <div className={over ? "sp-drop over" : "sp-drop"} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop}>
        <p><strong>Drag photos here</strong> or choose them. JPG, PNG or WEBP, up to 8 MB each.</p>
        <div className="sp-drop-actions">
          <label className="sp-btn-line">Choose photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sp-file" onChange={pick} /></label>
          <label className="sp-btn-line sp-camera">Take a photo<input type="file" accept="image/*" capture="environment" className="sp-file" onChange={pick} /></label>
        </div>
      </div>
      {photos.length > 0 && (
        <>
          <p className="sp-hint">The first photo is the cover. Drag to reorder, or use the arrows.</p>
          <ul className="sp-photos">
            {urls.map((u, i) => (
              <li key={u} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (drag !== null) move(drag, i); setDrag(null); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt={`Photo ${i + 1}`} />
                {i === 0 && <span className="sp-cover">Cover</span>}
                <div>
                  <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, i - 1)}>←</button>
                  <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => onChange(photos.filter((_, j) => j !== i))}>×</button>
                  <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === photos.length - 1} onClick={() => move(i, i + 1)}>→</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Variants({ l, patch }: { l: Listing; patch: (p: Partial<Listing>) => void }) {
  const [custom, setCustom] = useState("");
  const [value, setValue] = useState("");
  const toggle = (s: string) => patch({ sizes: l.sizes.some((r) => r.size === s) ? l.sizes.filter((r) => r.size !== s) : [...l.sizes, { size: s, stock: "" }] });
  const addSize = () => { const s = custom.trim().slice(0, 20); if (s && !l.sizes.some((r) => r.size === s)) patch({ sizes: [...l.sizes, { size: s, stock: "" }] }); setCustom(""); };
  const addValue = () => {
    const v = value.trim();
    if (v && l.option && !l.option.values.some((x) => x.value.toLowerCase() === v.toLowerCase())) patch({ option: { ...l.option, values: [...l.option.values, { value: v, images: [] }] } });
    setValue("");
  };
  return (
    <div className="sp-stack">
      <label className="sp-check"><input type="checkbox" checked={l.hasSizes} onChange={(e) => patch({ hasSizes: e.target.checked })} />This product comes in sizes</label>
      {l.hasSizes && (
        <div>
          <div className="sp-sizes" role="group" aria-label="Sizes">
            {PRESET_SIZES.map((s) => <button key={s} type="button" aria-pressed={l.sizes.some((r) => r.size === s)} onClick={() => toggle(s)}>{s}</button>)}
          </div>
          <div className="sp-inline">
            <input className="field-input" aria-label="Another size" placeholder="Another size, e.g. 32" value={custom} maxLength={20} onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }} />
            <Button variant="secondary" onClick={addSize}>Add</Button>
          </div>
        </div>
      )}
      <label className="sp-check"><input type="checkbox" checked={!!l.option} onChange={(e) => patch({ option: e.target.checked ? { name: "Colour", values: [] } : null })} />This product comes in colours or another option</label>
      {l.option && (
        <div className="sp-stack">
          <Field label="Option name" htmlFor="w-opt"><input id="w-opt" className="field-input" value={l.option.name} maxLength={30} onChange={(e) => patch({ option: { ...l.option!, name: e.target.value } })} /></Field>
          <div className="sp-inline">
            <input className="field-input" aria-label={`Add ${l.option.name}`} placeholder="e.g. Black" value={value} maxLength={50} onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addValue(); } }} />
            <Button variant="secondary" onClick={addValue}>Add</Button>
          </div>
          {l.option.values.map((v) => (
            <div key={v.value} className="sp-inline" style={{ alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <ValueGallery label={v.value} images={v.images} onChange={(images) => patch({ option: { ...l.option!, values: l.option!.values.map((x) => x.value === v.value ? { ...x, images } : x) } })} />
              </div>
              <button type="button" className="sp-x" aria-label={`Remove ${v.value}`} onClick={() => patch({ option: { ...l.option!, values: l.option!.values.filter((x) => x.value !== v.value) } })}>×</button>
            </div>
          ))}
        </div>
      )}
      <div>
        <p className="sp-sub-h">Stock</p>
        {l.option ? (
          <div className="sp-stock">
            {stockCombos(l).map((c) => (
              <Field key={c.key} label={c.label} htmlFor={`w-${c.key}`}>
                <input id={`w-${c.key}`} className="field-input" inputMode="numeric" value={l.comboStock[c.key] ?? ""} onChange={(e) => patch({ comboStock: { ...l.comboStock, [c.key]: e.target.value } })} />
              </Field>
            ))}
          </div>
        ) : l.hasSizes ? (
          <div className="sp-stock">
            {l.sizes.map((r) => (
              <Field key={r.size} label={r.size} htmlFor={`w-s-${r.size}`}>
                <input id={`w-s-${r.size}`} className="field-input" inputMode="numeric" value={r.stock} onChange={(e) => patch({ sizes: l.sizes.map((x) => x.size === r.size ? { ...x, stock: e.target.value } : x) })} />
              </Field>
            ))}
          </div>
        ) : (
          <Field label="Units in stock" htmlFor="w-stock"><input id="w-stock" className="field-input" inputMode="numeric" value={l.stock} style={{ maxWidth: 180 }} onChange={(e) => patch({ stock: e.target.value })} /></Field>
        )}
      </div>
    </div>
  );
}

function Preview({ listing, photos, categoryName, price, mrp }: { listing: Listing; photos: File[]; categoryName?: string; price: string | null; mrp: string | null }) {
  const [cover, setCover] = useState<string | null>(null);
  useEffect(() => {
    if (!photos[0]) { setCover(null); return; }
    const u = URL.createObjectURL(photos[0]);
    setCover(u);
    return () => URL.revokeObjectURL(u);
  }, [photos]);
  return (
    <aside className="sp-preview" aria-label="Live preview">
      <p className="sp-sub-h">Live preview <Badge status="draft" label="Draft" /></p>
      <div className="sp-preview-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {cover ? <img src={cover} alt="" /> : <div className="sp-preview-empty">Your cover photo</div>}
        <div>
          <p className="sp-preview-cat">{categoryName ?? "Category"}</p>
          <p className="sp-preview-name">{listing.name.trim() || "Your product title"}</p>
          <p className="sp-preview-price">{price ?? "Price"}{mrp && <s>{mrp}</s>}</p>
          {listing.hasSizes && listing.sizes.length > 0 && <p className="sp-preview-opts">{listing.sizes.map((s) => s.size).join(" · ")}</p>}
          {listing.option && listing.option.values.length > 0 && <p className="sp-preview-opts">{listing.option.values.map((v) => v.value).join(" · ")}</p>}
        </div>
      </div>
    </aside>
  );
}
