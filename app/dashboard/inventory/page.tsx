"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { api, type InventoryLine, type Product } from "../../lib/seller-api";
import { stockRows, stockState, type StockRow } from "../../lib/insights";
import { lowStockThreshold, rememberLowStock } from "../../lib/low-stock";
import { featureOn } from "../../lib/features";
import { useDashboardSeller } from "../seller-context";
import { Alert, Card, EmptyState, Field, PageHeader, PageSkeleton, RED } from "../../components/portal-ui";

type Filter = "all" | "low" | "out";
const STATE_LABEL = { out: "Out of stock", low: "Low stock", ok: "In stock" };

const clean = (raw: string) => raw.replace(/\D/g, "").slice(0, 6);

export default function InventoryPage() {
  const seller = useDashboardSeller();
  const showSku = featureOn("sku");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [threshold, setThreshold] = useState(() => lowStockThreshold(seller));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const table = useRef<HTMLTableElement>(null);

  const load = useCallback(async (quiet = false) => {
    try { setProducts((await api.products()).products); setError(""); }
    catch (err) { if (!quiet) setError(err instanceof Error ? err.message : "Could not load inventory"); }
  }, []);
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("filter");
    if (f === "low" || f === "out") setFilter(f);
    void load();
    // Orders reduce stock, so keep the numbers live. Rows being edited keep their draft.
    const t = setInterval(() => { if (document.visibilityState === "visible") void load(true); }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const rows = useMemo(() => stockRows(products ?? []), [products]);
  const counts = useMemo(() => ({
    all: rows.length,
    low: rows.filter(r => stockState(r.stock, threshold) === "low").length,
    out: rows.filter(r => stockState(r.stock, threshold) === "out").length,
  }), [rows, threshold]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter(r => filter === "all" || stockState(r.stock, threshold) === filter)
      .filter(r => !q || [r.name, r.variant, r.sku].some(v => v?.toLowerCase().includes(q)))
      .sort((a, b) => a.stock - b.stock);
  }, [rows, filter, query, threshold]);

  const setRowStock = (row: StockRow, stock: number) => setProducts(ps => (ps ?? []).map(p => {
    if (p.id !== row.productId) return p;
    if (row.variantId) return { ...p, variants: (p.variants ?? []).map(v => v.id === row.variantId ? { ...v, stock } : v) };
    if (row.size) return { ...p, product_variants: (p.product_variants ?? []).map(v => v.size === row.size ? { ...v, stock } : v) };
    return { ...p, stock };
  }));

  const dropDraft = (key: string) => setDrafts(d => { const n = { ...d }; delete n[key]; return n; });

  const save = async (row: StockRow) => {
    const raw = drafts[row.key];
    if (raw === undefined) return;
    const stock = Number(raw);
    if (raw === "" || stock === row.stock) { dropDraft(row.key); return; }
    if (row.size && !row.variantId) { setError("Reload the page and try again: this size has no stock id yet."); return; }
    const line: InventoryLine = row.variantId ? { product_id: row.productId, variant_id: row.variantId, stock } : { product_id: row.productId, stock };
    setSaving(row.key); setError("");
    try {
      await api.updateInventory([line]);
      setRowStock(row, stock);
      dropDraft(row.key);
      setSaved(row.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save stock");
    } finally {
      setSaving(null);
    }
  };

  const focusRow = (from: HTMLInputElement, step: number) => {
    const inputs = Array.from(table.current?.querySelectorAll<HTMLInputElement>("input.sp-stock") ?? []);
    const next = inputs[inputs.indexOf(from) + step];
    if (next) { next.focus(); next.select(); }
  };

  /** Enter saves and moves down, Escape undoes, arrow keys move between rows. */
  const onKey = (e: KeyboardEvent<HTMLInputElement>, row: StockRow) => {
    if (e.key === "Enter") { e.preventDefault(); void save(row); focusRow(e.currentTarget, 1); }
    else if (e.key === "Escape") { dropDraft(row.key); }
    else if (e.key === "ArrowDown") { e.preventDefault(); focusRow(e.currentTarget, 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusRow(e.currentTarget, -1); }
  };

  const changeThreshold = (raw: string) => {
    const n = Math.max(1, Number(clean(raw)) || 1);
    setThreshold(n);
    rememberLowStock(seller.id, n);
    // Kept in this browser, and saved on the account (PUT /seller/inventory/threshold)
    api.saveSettings({ low_stock_threshold: n }).catch(() => undefined);
  };

  if (!products) return error ? <Alert>{error}</Alert> : <PageSkeleton stats={0} rows={8} />;

  return (
    <div>
      <PageHeader title="Inventory" sub="Live stock for every product and variant. Saving applies at once with no review, and the listing stays live. Enter saves, Esc undoes, arrow keys move between rows."
        action={(
          <div style={{ width: 150 }}>
            <Field label="Low-stock alert at" htmlFor="low-stock">
              <input id="low-stock" className="sp-search" style={{ width: "100%" }} inputMode="numeric" value={threshold} onChange={e => changeThreshold(e.target.value)} />
            </Field>
          </div>
        )} />

      {error && <div style={{ marginBottom: 14 }}><Alert>{error}</Alert></div>}

      {rows.length === 0 ? (
        <EmptyState title="No stock to manage yet" sub="Add a product and its variants appear here."
          action={<Link href="/dashboard/products?new=1" className="sp-btn-red">Add a product</Link>} />
      ) : (
        <>
          <div className="sp-toolbar">
            <input className="sp-search" placeholder={showSku ? "Search product, variant or SKU" : "Search product or variant"} aria-label="Search inventory" value={query} onChange={e => setQuery(e.target.value)} />
            <div className="sp-pills" role="group" aria-label="Stock filter">
              {(["all", "low", "out"] as Filter[]).map(f => (
                <button key={f} type="button" className="sp-pill" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f === "all" ? "All" : f === "low" ? "Low stock" : "Out of stock"} ({counts[f]})
                </button>
              ))}
            </div>
          </div>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            {shown.length === 0 ? (
              <p style={{ padding: "28px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>
                {filter === "all" ? "No matches for that search." : "Nothing here. Your stock looks healthy."}
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table ref={table} className="sp-table sp-cards sp-inv">
                  <caption className="n-sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Stock by product and variant</caption>
                  <thead><tr><th scope="col">Product</th><th scope="col">Variant</th>{showSku && <th scope="col">SKU</th>}<th scope="col">Status</th><th scope="col" className="sp-num">Stock</th></tr></thead>
                  <tbody>
                    {shown.map(r => {
                      const state = stockState(r.stock, threshold);
                      const draft = drafts[r.key];
                      return (
                        <tr key={r.key} className={state === "ok" ? "" : state}>
                          <td className="sp-cell-full">
                            <div className="sp-cell-main">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {r.image ? <img src={r.image} alt="" className="sp-thumb" /> : <span className="sp-thumb" />}
                              <span style={{ fontWeight: 700 }}>{r.name}</span>
                            </div>
                          </td>
                          <td data-label="Variant">{r.variant ?? "—"}</td>
                          {showSku && <td data-label="SKU" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12 }}>{r.sku ?? "—"}</td>}
                          <td data-label="Status"><span className={`sp-stock-tag ${state}`}>{STATE_LABEL[state]}</span></td>
                          <td data-label="Stock" className="sp-num">
                            <input className={draft !== undefined ? "sp-stock dirty" : "sp-stock"} inputMode="numeric" aria-label={`Stock for ${r.name}${r.variant ? `, ${r.variant}` : ""}`}
                              value={draft ?? String(r.stock)} disabled={saving === r.key}
                              onChange={e => { setSaved(null); setDrafts(d => ({ ...d, [r.key]: clean(e.target.value) })); }}
                              onBlur={() => void save(r)} onKeyDown={e => onKey(e, r)} onFocus={e => e.target.select()} />
                            {saved === r.key && <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 700, color: "#166534" }} role="status">Saved</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          <p style={{ fontSize: 12, color: "#888", marginTop: 10 }}>
            Prices, photos and variants are changed in <Link href="/dashboard/products" style={{ color: RED, fontWeight: 600 }}>Catalogue</Link>.
          </p>
        </>
      )}
    </div>
  );
}
