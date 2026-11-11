"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { api, type Category } from "../../../lib/seller-api";
import { xlsxTemplate, readBulkXlsx } from "../../../lib/bulk-xlsx";
import { MAX_ROWS, csvTemplate, errorCsv, missingPhotos, photosFor, readBulkCsv, type BulkRow } from "../../../lib/bulk-csv";
import { listingFormData } from "../../../lib/product-listing";
import { useDashboardSeller, useSellerCurrency } from "../../seller-context";
import { Alert, Button, Card, PageHeader, PageSkeleton } from "../../../components/portal-ui";

type Outcome = { state: "done" } | { state: "failed"; error: string };

function download(name: string, data: string | Blob) {
  const blob = typeof data === "string" ? new Blob([data], { type: "text/csv;charset=utf-8" }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadPage() {
  const seller = useDashboardSeller();
  const { country } = useSellerCurrency();
  const locked = !!seller.agreement?.resign_required || (country === "AE" && !seller.uae?.ready);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [rows, setRows] = useState<BulkRow[] | null>(null);
  const [fatal, setFatal] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({});
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => { api.categories().then((r) => setCategories(r.categories)).catch(() => setCategories([])); }, []);

  const checked = useMemo(() => (rows ?? []).map((row) => {
    const missing = row.errors.length ? [] : missingPhotos(row, files);
    const outcome = outcomes[row.line];
    const errors = [...row.errors, ...(missing.length ? [`Photo not chosen: ${missing.join(", ")}`] : []), ...(outcome?.state === "failed" ? [outcome.error] : [])];
    return { row, errors, outcome };
  }), [rows, files, outcomes]);
  const ready = checked.filter((c) => !c.errors.length && c.outcome?.state !== "done");
  const bad = checked.filter((c) => c.errors.length);
  const done = checked.filter((c) => c.outcome?.state === "done").length;

  const pickCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const isExcel = /\.xlsx$/i.test(file.name);
    const res = isExcel ? await readBulkXlsx(await file.arrayBuffer(), categories ?? []) : readBulkCsv(await file.text(), categories ?? []);
    setFatal(res.fatal ?? ""); setRows(res.fatal ? null : res.rows); setOutcomes({});
  };
  const pickPhotos = (e: ChangeEvent<HTMLInputElement>) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; setFiles((p) => [...p, ...f]); };

  // One at a time, so a seller on a phone connection is not sending 200 uploads at once
  const upload = async () => {
    const queue = ready.map((c) => c.row);
    setProgress({ done: 0, total: queue.length });
    for (let i = 0; i < queue.length; i++) {
      const row = queue[i];
      try {
        await api.createProduct(listingFormData(row.listing!, country, photosFor(row, files)));
        setOutcomes((o) => ({ ...o, [row.line]: { state: "done" } }));
      } catch (err) {
        setOutcomes((o) => ({ ...o, [row.line]: { state: "failed", error: err instanceof Error ? err.message : "Could not create" } }));
      }
      setProgress({ done: i + 1, total: queue.length });
    }
    setProgress(null);
  };

  if (!categories) return <PageSkeleton stats={0} />;
  const busy = !!progress;

  return (
    <div>
      <PageHeader title="Bulk upload" sub={`Add up to ${MAX_ROWS} products from one Excel file. Every product goes to NOTMADE for review before it goes live.`}
        action={<Link href="/dashboard/products" className="sp-link">Back to Catalogue</Link>} />
      {locked && <div style={{ marginBottom: 14 }}><Alert kind="warn">Sign your seller agreement to add products.</Alert></div>}

      <ol className="sp-bulk">
        <li><Card>
          <h2>1. Get the template</h2>
          <p>Prices are in your own currency. Use | between sizes, stock per size, and photo file names. Category names must match your list.</p>
          <div className="sp-inline">
            <Button variant="secondary" onClick={() => void xlsxTemplate(categories).then((b) => download("notmade-bulk-listing-template.xlsx", b))}>Download Excel template</Button>
            <Button variant="secondary" onClick={() => download("notmade-products-template.csv", csvTemplate(categories))}>CSV version</Button>
          </div>
        </Card></li>
        <li><Card>
          <h2>2. Upload your filled-in file</h2>
          <p>We check every row here first. Nothing is sent yet.</p>
          <label className="sp-btn-line">Choose Excel or CSV<input type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sp-file" disabled={locked || busy} onChange={(e) => void pickCsv(e)} /></label>
        </Card></li>
        <li><Card>
          <h2>3. Choose the photos</h2>
          <p>Pick every photo file your sheet names. Each product needs at least one. {files.length > 0 && `${files.length} chosen.`}</p>
          <label className="sp-btn-line">Choose photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sp-file" disabled={locked || busy} onChange={pickPhotos} /></label>
        </Card></li>
      </ol>

      {fatal && <div style={{ marginTop: 16 }}><Alert>{fatal}</Alert></div>}

      {rows && (
        <Card style={{ marginTop: 16, padding: 0 }}>
          <div className="sp-card-head sp-bulk-head">
            <h2>{ready.length} ready, {bad.length} to fix{done ? `, ${done} submitted` : ""}</h2>
            <div className="sp-inline">
              {bad.length > 0 && <Button variant="secondary" disabled={busy} onClick={() => download("notmade-products-errors.csv", errorCsv(bad))}>Download rows to fix</Button>}
              <Button disabled={busy || locked || ready.length === 0} onClick={() => void upload()}>{progress ? `Submitting ${progress.done} of ${progress.total}…` : `Submit ${ready.length} for review`}</Button>
            </div>
          </div>
          <div className="sp-scroll" tabIndex={0} role="region" aria-label="Rows in your file">
            <table className="sp-table sp-stacked">
              <thead><tr><th scope="col">Row</th><th scope="col">Product</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {checked.map(({ row, errors, outcome }) => (
                  <tr key={row.line} className={errors.length ? "sp-row-bad" : undefined}>
                    <td data-label="Row">{row.line}</td>
                    <td data-label="Product">{row.raw[0] || "—"}</td>
                    <td data-label="Status">{outcome?.state === "done" ? "Submitted · In review" : errors.length ? errors.join(". ") : "Ready"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
