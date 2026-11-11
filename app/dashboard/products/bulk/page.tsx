"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { ApiError, api, type BulkCategory, type BulkRowError, type BulkTemplate, type BulkValidation } from "../../../lib/seller-api";
import { xlsxTemplate, readBulkXlsx } from "../../../lib/bulk-xlsx";
import { MAX_ROWS, collectPhotos, csvTemplate, drivePhotos, errorCsv, missingPhotos, photoNotChosen, readBulkCsv, rowError, type SheetRow } from "../../../lib/bulk-csv";
import { commissionView } from "../../../lib/bulk-commission";
import { useDashboardSeller, useSellerCurrency } from "../../seller-context";
import CategoryPicker from "../../../components/CategoryPicker";
import { Alert, Button, Card, PageHeader, PageSkeleton } from "../../../components/portal-ui";

type Outcome = { state: "done" } | { state: "failed"; error: BulkRowError };

function download(name: string, data: string | Blob) {
  const blob = typeof data === "string" ? new Blob(["﻿" + data], { type: "text/csv;charset=utf-8" }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
const slugFile = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category";

export default function BulkUploadPage() {
  const seller = useDashboardSeller();
  const { country } = useSellerCurrency();
  const agreementLocked = !!seller.agreement?.resign_required || (country === "AE" && !seller.uae?.ready);

  const [categories, setCategories] = useState<BulkCategory[] | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [template, setTemplate] = useState<BulkTemplate | null>(null);
  const [templateError, setTemplateError] = useState("");
  const [rows, setRows] = useState<SheetRow[] | null>(null);
  const [validation, setValidation] = useState<BulkValidation | null>(null);
  const [checking, setChecking] = useState(false);
  const [fatal, setFatal] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({});
  const [progress, setProgress] = useState<{ done: number; total: number; photo?: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  // Drive photos already downloaded this session, by drive-<id>, so a retry or a second product with the same photo skips it
  const driveCache = useMemo(() => new Map<string, File>(), []);

  useEffect(() => { api.bulkCategories().then((r) => setCategories(r.categories)).catch(() => setCategories([])); }, []);

  // Step 1 decides everything else: a new category clears the file, the photos and the results
  const chooseCategory = (id: string) => {
    if (id === categoryId) return;
    setCategoryId(id); setTemplate(null); setTemplateError(""); setRows(null); setValidation(null); setFatal(""); setFiles([]); setOutcomes({}); setConfirming(false);
    api.bulkTemplate(id).then(setTemplate).catch((e) => setTemplateError(e instanceof Error ? e.message : "Could not load this category's template"));
  };

  const locked = agreementLocked || (template ? !template.can_submit : false);
  const busy = !!progress;
  const ready = !!template;

  // Rows with the backend's verdict, plus the one check made here: the photo files each product names have been picked.
  // Every error has the backend's { field, code, message } shape; the Row column says which row.
  const checked = useMemo(() => {
    if (!rows || !validation) return [];
    const byLine = new Map(validation.rows.map((r) => [r.line, r]));
    return validation.products.flatMap((p) => {
      const missing = p.ok ? missingPhotos(p, files) : [];
      const outcome = outcomes[p.lines[0]];
      return p.lines.map((line) => {
        const row = rows.find((r) => r.line === line)!;
        const errors: BulkRowError[] = [
          ...(byLine.get(line)?.errors ?? []),
          ...(missing.length ? [photoNotChosen(missing)] : []),
          ...(outcome?.state === "failed" ? [outcome.error] : []),
        ];
        return { row, product: p, errors, outcome };
      });
    }).sort((a, b) => a.row.line - b.row.line);
  }, [rows, validation, files, outcomes]);

  const products = validation?.products ?? [];
  const readyProducts = products.filter((p) => p.ok && !missingPhotos(p, files).length && outcomes[p.lines[0]]?.state !== "done" && outcomes[p.lines[0]]?.state !== "failed");
  const driveCount = products.reduce((n, p) => n + (p.ok ? drivePhotos(p).length : 0), 0);
  const readyRows = readyProducts.reduce((n, p) => n + p.lines.length, 0);
  const bad = checked.filter((c) => c.errors.length);
  const done = products.filter((p) => outcomes[p.lines[0]]?.state === "done").length;

  const pickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !template) return;
    setValidation(null); setOutcomes({}); setConfirming(false);
    const isExcel = /\.xlsx$/i.test(file.name);
    const res = isExcel ? await readBulkXlsx(await file.arrayBuffer(), template) : readBulkCsv(await file.text(), template);
    setFatal(res.fatal ?? ""); setRows(res.fatal ? null : res.rows);
    if (res.fatal) return;
    setChecking(true);
    try {
      setValidation(await api.bulkValidate(template.category.id, res.rows.map((r) => r.cells)));
    } catch (err) {
      setRows(null);
      setFatal(err instanceof Error ? err.message : "Could not check this file");
    } finally {
      setChecking(false);
    }
  };
  const pickPhotos = (e: ChangeEvent<HTMLInputElement>) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; setFiles((p) => [...p, ...f]); };

  // One product at a time, and its Drive photos one at a time, so a seller on a phone connection is not sending 200
  // uploads at once. A Drive photo that fails holds back only its own product, with the reason on its rows.
  const upload = async () => {
    if (!template || !rows) return;
    setConfirming(false);
    const queue = readyProducts;
    setProgress({ done: 0, total: queue.length });
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      const cells = p.lines.map((line) => rows.find((r) => r.line === line)!.cells);
      const fail = (error: BulkRowError) => setOutcomes((o) => ({ ...o, [p.lines[0]]: { state: "failed", error } }));
      const photos = await collectPhotos(p, files, api.importDrivePhoto, driveCache,
        (n, total) => setProgress({ done: i, total: queue.length, photo: `Drive photo ${n} of ${total}` }));
      if ("error" in photos) { fail(photos.error); setProgress({ done: i + 1, total: queue.length }); continue; }
      try {
        await api.bulkCreate(template.category.id, cells, photos.files);
        setOutcomes((o) => ({ ...o, [p.lines[0]]: { state: "done" } }));
      } catch (err) {
        const data = err instanceof ApiError ? err.data : {};
        fail(rowError(typeof data.field === "string" ? data.field : "row", typeof data.code === "string" ? data.code : "CREATE_FAILED", err instanceof Error ? err.message : "Could not create"));
      }
      setProgress({ done: i + 1, total: queue.length });
    }
    setProgress(null);
  };
  // One click when every row is right. With rows to fix, say what is held back before sending the rest
  const submit = () => (bad.length ? setConfirming(true) : void upload());

  if (!categories) return <PageSkeleton stats={0} />;
  const view = template ? commissionView(template.commission) : null;
  const productWord = (n: number) => `${n} product${n === 1 ? "" : "s"}`;

  return (
    <div>
      <PageHeader title="Bulk upload" sub={`Add up to ${MAX_ROWS} rows from one Excel file, one category per file. Every product goes to NOTMADE for review before it goes live.`}
        action={<Link href="/dashboard/products" className="sp-link">Back to Catalogue</Link>} />
      {agreementLocked && <div style={{ marginBottom: 14 }}><Alert kind="warn">Sign your seller agreement to add products. <Link href="/dashboard/agreement" style={{ color: "#CC0000", fontWeight: 700 }}>Review and sign</Link></Alert></div>}

      <Card>
        <div className="sp-bulk-cat">
          <div>
            <h2 className="sp-bulk-h" id="bulk-cat-label">1. Choose the category</h2>
            <p className="sp-bulk-p">One file is for one category. The template, the columns and the checks follow from it.</p>
            <label htmlFor="bulk-cat" className="sp-visually-hidden">Category</label>
            <CategoryPicker id="bulk-cat" categories={categories} value={categoryId} onChange={chooseCategory} />
            {!categoryId && <p className="sp-bulk-hint">Choose a category to continue.</p>}
            {template && (
              <p className="sp-bulk-hint">
                {template.uses_sizes ? `One row per size and colour. Sizes: ${template.size_set?.label ?? ""}.` : `${template.category.name} has no sizes: one row per product.`}
              </p>
            )}
          </div>
          {templateError && <Alert>{templateError}</Alert>}
          {template && view && (
            <section className="sp-bulk-rate" aria-labelledby="bulk-rate-h">
              <h3 id="bulk-rate-h">Commission on {template.category.name}</h3>
              {view.headline && <p className="sp-bulk-rate-big">{view.headline} <span>of the selling price</span></p>}
              {view.options.length > 0 && (
                <ul className="sp-bulk-rate-opts">
                  {view.options.map((o) => <li key={o.mode}><strong>{o.title}</strong>{o.detail && <small>{o.detail}</small>}</li>)}
                </ul>
              )}
              <ul className="sp-bulk-rate-notes">{view.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </section>
          )}
        </div>
      </Card>

      <ol className="sp-bulk" style={{ marginTop: 12 }} aria-label="Upload steps">
        <li className={ready ? undefined : "is-off"}><Card>
          <h2>2. Get the template</h2>
          <p>{template ? `Made for ${template.category.name}. The category is filled in; rows of another category are refused. Prices are in ${template.currency}.` : "Choose a category first."}</p>
          <div className="sp-inline">
            <Button variant="secondary" disabled={!ready} onClick={() => template && void xlsxTemplate(template).then((b) => download(`notmade-bulk-${slugFile(template.category.name)}.xlsx`, b))}>Download Excel template</Button>
            <Button variant="secondary" disabled={!ready} onClick={() => template && download(`notmade-bulk-${slugFile(template.category.name)}.csv`, csvTemplate(template))}>CSV version</Button>
          </div>
        </Card></li>
        <li className={ready ? undefined : "is-off"}><Card>
          <h2>3. Upload your filled-in file</h2>
          <p>We check every row first and show you any errors. Nothing is sent yet.</p>
          <label className={`sp-btn-line${!ready || locked || busy ? " is-disabled" : ""}`}>{checking ? "Checking…" : "Choose Excel or CSV"}<input type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sp-file" disabled={!ready || locked || busy || checking} onChange={(e) => void pickFile(e)} /></label>
        </Card></li>
        <li className={ready ? undefined : "is-off"}><Card>
          <h2>4. Choose the photos</h2>
          <p>Pick every photo file your sheet names, {template ? `${template.limits.min_photos} to ${template.limits.max_photos}` : "1 to 8"} per product. {files.length > 0 && `${files.length} chosen.`}</p>
          <p className="sp-bulk-hint">Public Google Drive file links in image_files need no picking: we download them when you submit. In Drive, set Share &gt; General access to &quot;Anyone with the link&quot;. Folder links do not work.{driveCount > 0 && ` ${driveCount} Drive photo${driveCount === 1 ? "" : "s"} in this file.`}</p>
          <label className={`sp-btn-line${!ready || locked || busy ? " is-disabled" : ""}`}>Choose photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sp-file" disabled={!ready || locked || busy} onChange={pickPhotos} /></label>
        </Card></li>
      </ol>

      {fatal && <div style={{ marginTop: 16 }}><Alert>{fatal}</Alert></div>}

      {template && rows && validation && (
        <Card style={{ marginTop: 16, padding: 0 }}>
          <div className="sp-card-head sp-bulk-head">
            <h2>{productWord(readyProducts.length)} ready ({readyRows} rows), {bad.length} row{bad.length === 1 ? "" : "s"} to fix{done ? `, ${productWord(done)} submitted` : ""}</h2>
            <div className="sp-inline">
              {bad.length > 0 && <Button variant="secondary" disabled={busy} onClick={() => download(`notmade-bulk-${slugFile(template.category.name)}-errors.csv`, errorCsv(template.columns, bad))}>Download error file</Button>}
              <Button disabled={busy || locked || readyProducts.length === 0} onClick={submit}>{progress ? `Submitting ${progress.done} of ${progress.total}${progress.photo ? ` · ${progress.photo}` : ""}…` : `Submit ${productWord(readyProducts.length)} for review`}</Button>
            </div>
          </div>
          {confirming && (
            <div className="sp-bulk-confirm">
              <Alert kind="warn">
                {bad.length} row{bad.length === 1 ? " has" : "s have"} errors and will not be sent. Only the ready {productWord(readyProducts.length)} {readyProducts.length === 1 ? "goes" : "go"} to NOTMADE for review.
              </Alert>
              <div className="sp-inline">
                <Button onClick={() => void upload()}>Submit {productWord(readyProducts.length)} for review</Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
              </div>
            </div>
          )}
          <div className="sp-scroll" tabIndex={0} role="region" aria-label="Rows in your file">
            <table className="sp-table sp-stacked sp-bulk-table">
              <thead><tr><th scope="col">Row</th><th scope="col">Product</th>{template.uses_sizes && <th scope="col">Variant</th>}<th scope="col">Status</th></tr></thead>
              <tbody>
                {checked.map(({ row, product, errors, outcome }) => (
                  <tr key={row.line} className={errors.length ? "sp-row-bad" : undefined}>
                    <td data-label="Row">{row.line}</td>
                    <td data-label="Product">{product.name || String(row.cells.name || "") || product.key || "—"}</td>
                    {template.uses_sizes && <td data-label="Variant">{[row.cells.colour, row.cells.size].filter(Boolean).join(" · ") || "—"}</td>}
                    <td data-label="Status">{outcome?.state === "done" ? "Submitted · In review" : errors.length ? errors.map((e) => e.message).join(". ") : "Ready"}</td>
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
