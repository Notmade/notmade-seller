"use client";

// Catalogue > Add photos: add photos to products the seller already has, from a sheet (Excel or CSV) or a table pasted
// or typed here. Not the one-category bulk upload. Each valid row becomes a change that waits for NOTMADE's approval;
// the live listing stays as it is.
import { useMemo, useState, type ChangeEvent, type ClipboardEvent } from "react";
import Link from "next/link";
import { api, type PhotoAddRowResult } from "../../../lib/seller-api";
import {
  COLUMNS, MAX_PHOTOS, MAX_ROWS, NOTE, collectRowPhotos, csvTemplate, download, errorCsv, missingFiles, readCsv, readPasted, readXlsx, xlsxTemplate,
  type PhotoColumn, type PhotoSheetRow,
} from "../../../lib/photo-add";
import { useDashboardSeller, useSellerCurrency } from "../../seller-context";
import { Alert, Button, Card, PageHeader, RED } from "../../../components/portal-ui";

type Outcome = { state: "sending" } | { state: "done" } | { state: "failed"; error: string };
type Source = "file" | "paste";

const LABEL: Record<PhotoColumn, string> = { product_name: "Product name", product_id: "Product ID", sku: "SKU", image_links: "Photo links or file names", variant_or_colour: "Colour / SKU" };
const blankRow = (): Record<PhotoColumn, string> => ({ product_name: "", product_id: "", sku: "", image_links: "", variant_or_colour: "" });
const csvBlob = (text: string) => new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" });

export default function AddPhotosPage() {
  const seller = useDashboardSeller();
  const { country } = useSellerCurrency();
  const locked = !!seller.agreement?.resign_required || (country === "AE" && !seller.uae?.ready);

  const [source, setSource] = useState<Source>("file");
  const [grid, setGrid] = useState<Record<PhotoColumn, string>[]>(() => [blankRow(), blankRow(), blankRow()]);
  const [rows, setRows] = useState<PhotoSheetRow[] | null>(null);
  const [results, setResults] = useState<PhotoAddRowResult[] | null>(null);
  const [fatal, setFatal] = useState("");
  const [checking, setChecking] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({});
  const [sending, setSending] = useState(false);
  const driveCache = useMemo(() => new Map<string, File>(), []);

  const reset = () => { setRows(null); setResults(null); setFatal(""); setOutcomes({}); };

  // The backend's verdict per row, plus the one check made here: the photo files a row names have been picked
  const checked = useMemo(() => (results ?? []).map((r) => {
    const miss = r.ok ? missingFiles(r, files) : [];
    const errors = [...r.errors.map((e) => e.message), ...(miss.length ? [`Row ${r.line}: photo choose nahi ki: ${miss.join(", ")}`] : [])];
    return { r, errors, ok: errors.length === 0 };
  }), [results, files]);
  const okRows = checked.filter((c) => c.ok);
  const badRows = checked.filter((c) => !c.ok);
  const namedFiles = (results ?? []).some((r) => r.photos.some((p) => p.source === "file"));

  async function check(read: { rows: PhotoSheetRow[]; fatal: string | null }) {
    setOutcomes({});
    if (read.fatal) { setRows(null); setResults(null); setFatal(read.fatal); return; }
    setFatal(""); setRows(read.rows); setChecking(true);
    try {
      setResults((await api.photoAddValidate(read.rows.map((r) => r.cells))).rows);
    } catch (err) {
      setResults(null);
      setFatal(err instanceof Error ? err.message : "Could not check this sheet");
    } finally {
      setChecking(false);
    }
  }

  const pickSheet = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    reset();
    await check(/\.xlsx$/i.test(f.name) ? await readXlsx(await f.arrayBuffer()) : readCsv(await f.text()));
  };

  const checkGrid = () => {
    const filled = grid.filter((g) => COLUMNS.some((c) => g[c].trim()));
    if (!filled.length) { setFatal("Type or paste at least one row."); return; }
    const table = [[...COLUMNS], ...filled.map((g) => COLUMNS.map((c) => g[c]))];
    void check(readPasted(table.map((r) => r.join("\t")).join("\n")));
  };

  /** Paste from Excel / Google Sheets into any cell: rows and columns spread from that cell. */
  const onPaste = (row: number, col: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!/[\t\n]/.test(text)) return;
    e.preventDefault();
    const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.length);
    setGrid((g) => {
      const next = g.map((x) => ({ ...x }));
      lines.slice(0, MAX_ROWS).forEach((line, i) => {
        while (next.length <= row + i) next.push(blankRow());
        line.split("\t").forEach((v, j) => { const key = COLUMNS[col + j]; if (key) next[row + i][key] = v.trim(); });
      });
      return next;
    });
  };

  const send = async () => {
    setSending(true);
    for (const { r } of okRows) {
      if (outcomes[r.line]?.state === "done") continue;
      setOutcomes((o) => ({ ...o, [r.line]: { state: "sending" } }));
      const row = rows?.find((x) => x.line === r.line);
      const photos = await collectRowPhotos(r, files, api.importDrivePhoto, driveCache);
      if ("error" in photos) { setOutcomes((o) => ({ ...o, [r.line]: { state: "failed", error: photos.error } })); continue; }
      try {
        await api.photoAddSubmit(row!.cells, photos.files);
        setOutcomes((o) => ({ ...o, [r.line]: { state: "done" } }));
      } catch (err) {
        setOutcomes((o) => ({ ...o, [r.line]: { state: "failed", error: err instanceof Error ? err.message : "Could not send this row" } }));
      }
    }
    setSending(false);
  };

  const errorFile = () => {
    const failed = checked.filter((c) => !c.ok || outcomes[c.r.line]?.state === "failed").map((c) => ({
      row: rows!.find((x) => x.line === c.r.line)!,
      errors: c.ok ? [(outcomes[c.r.line] as { error: string }).error] : c.errors,
    }));
    download("photo-rows-to-fix.csv", csvBlob(errorCsv(failed)));
  };

  const done = Object.values(outcomes).filter((o) => o.state === "done").length;
  const failedSends = Object.values(outcomes).filter((o) => o.state === "failed").length;

  return (
    <div>
      <PageHeader title="Add photos to existing products" sub="Add photos to products already in your catalogue. Nothing is removed. NOTMADE approves the new photos before customers see them, and your products stay live as they are until then."
        action={<Link href="/dashboard/products" className="sp-btn-line">Back to Catalogue</Link>} />

      {locked && (
        <div style={{ marginBottom: 14 }}>
          <Alert kind="warn">Sign your agreement to add photos. <Link href="/dashboard/agreement" style={{ color: RED, fontWeight: 700 }}>Review &amp; sign</Link></Alert>
        </div>
      )}

      <Card style={{ padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 15, fontWeight: 700 }}>1. Get the sheet</p>
        <p style={{ fontSize: 13, color: "#555555", marginTop: 4 }}>
          Columns: product_name, image_links, and optional product_id, sku, variant_or_colour. Note: {NOTE}. Up to {MAX_PHOTOS} photos per product in all.
        </p>
        <div className="sp-inline" style={{ marginTop: 10 }}>
          <Button variant="secondary" onClick={() => void xlsxTemplate().then((b) => download("add-photos-template.xlsx", b))}>Download Excel template</Button>
          <Button variant="ghost" onClick={() => download("add-photos-template.csv", csvBlob(csvTemplate()))}>CSV template</Button>
        </div>
      </Card>

      <Card style={{ padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 15, fontWeight: 700 }}>2. Upload the sheet, or paste the rows</p>
        <div className="sp-pills" role="group" aria-label="How to add rows" style={{ marginTop: 10 }}>
          {(["file", "paste"] as Source[]).map((s) => (
            <button key={s} type="button" className="sp-pill" aria-pressed={source === s} onClick={() => { setSource(s); reset(); }}>
              {s === "file" ? "Upload Excel or CSV" : "Paste or type"}
            </button>
          ))}
        </div>
        {source === "file" ? (
          <label className="sp-btn-line" style={{ marginTop: 12, display: "inline-block", cursor: locked ? "not-allowed" : "pointer" }}>
            Choose .xlsx or .csv file
            <input type="file" accept=".xlsx,.csv,text/csv" hidden disabled={locked} onChange={(e) => void pickSheet(e)} aria-label="Sheet file" />
          </label>
        ) : (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 12, color: "#777777", marginBottom: 8 }}>Copy rows in Excel or Google Sheets and paste into the first cell. Rows and columns fill in.</p>
            <div className="sp-scroll">
              <table className="sp-table sp-stacked">
                <thead><tr>{COLUMNS.map((c) => <th key={c} style={{ textAlign: "left", fontSize: 12 }}>{LABEL[c]}</th>)}<th aria-label="Remove row" /></tr></thead>
                <tbody>
                  {grid.map((g, i) => (
                    <tr key={i}>
                      {COLUMNS.map((c, j) => (
                        <td key={c} data-label={LABEL[c]}>
                          <input className="field-input" style={{ fontSize: 13, minWidth: 0 }} value={g[c]} aria-label={`Row ${i + 1} ${LABEL[c]}`}
                            onPaste={onPaste(i, j)} onChange={(e) => setGrid((x) => x.map((r, k) => (k === i ? { ...r, [c]: e.target.value } : r)))} />
                        </td>
                      ))}
                      <td data-label=""><button type="button" aria-label={`Remove row ${i + 1}`} onClick={() => setGrid((x) => (x.length > 1 ? x.filter((_, k) => k !== i) : [blankRow()]))}
                        style={{ width: 40, height: 40, border: "none", background: "transparent", color: "#999999", cursor: "pointer", fontSize: 18 }}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sp-inline" style={{ marginTop: 10 }}>
              <Button variant="ghost" onClick={() => setGrid((x) => (x.length < MAX_ROWS ? [...x, blankRow()] : x))}>+ Row</Button>
              <Button onClick={checkGrid} disabled={locked || checking}>{checking ? "Checking…" : "Check rows"}</Button>
            </div>
          </div>
        )}
        {fatal && <div style={{ marginTop: 12 }}><Alert>{fatal}</Alert></div>}
      </Card>

      {namedFiles && (
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 700 }}>3. Pick the photo files the rows name</p>
          <p style={{ fontSize: 13, color: "#555555", marginTop: 4 }}>Google Drive links are downloaded for you, one at a time. jpg, png or webp, up to 8MB each.</p>
          <label className="sp-btn-line" style={{ marginTop: 10, display: "inline-block", cursor: "pointer" }}>
            Choose photos ({files.length} chosen)
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" hidden aria-label="Photo files"
              onChange={(e) => { const picked = Array.from(e.target.files ?? []); e.target.value = ""; setFiles((f) => [...f.filter((x) => !picked.some((p) => p.name === x.name)), ...picked]); }} />
          </label>
        </Card>
      )}

      {results && (
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 700 }}>Preview: {okRows.length} ready, {badRows.length} with errors</p>
            <div className="sp-inline">
              {(badRows.length > 0 || failedSends > 0) && <Button variant="ghost" onClick={errorFile}>Download error file</Button>}
              <Button onClick={() => void send()} disabled={locked || sending || !okRows.length || done === okRows.length}>
                {sending ? `Sending… ${done}/${okRows.length}` : `Send ${okRows.length} ready row${okRows.length === 1 ? "" : "s"} for approval`}
              </Button>
            </div>
          </div>
          {done > 0 && !sending && <div style={{ marginTop: 10 }}><Alert kind="success">{done} row{done === 1 ? "" : "s"} sent. Your products stay live as they are until NOTMADE approves the new photos. See them in <Link href="/dashboard/products" style={{ color: RED, fontWeight: 700 }}>Catalogue</Link> under Changes pending.</Alert></div>}
          <div className="sp-scroll" style={{ marginTop: 12 }}>
            <table className="sp-table sp-stacked">
              <thead><tr><th style={{ textAlign: "left" }}>Row</th><th style={{ textAlign: "left" }}>Product</th><th style={{ textAlign: "left" }}>Adds to</th><th style={{ textAlign: "left" }}>Photos</th><th style={{ textAlign: "left" }}>Status</th></tr></thead>
              <tbody>
                {checked.map(({ r, errors, ok }) => {
                  const out = outcomes[r.line];
                  return (
                    <tr key={r.line} data-row={r.line} data-ok={ok}>
                      <td data-label="Row">{r.line}</td>
                      <td data-label="Product" style={{ whiteSpace: "normal" }}>{r.product?.name ?? rows?.find((x) => x.line === r.line)?.cells.product_name ?? "—"}</td>
                      <td data-label="Adds to">{r.target?.label ?? "—"}</td>
                      <td data-label="Photos">{r.current_photos !== null ? `${r.current_photos} → ${r.current_photos + r.photos.length}` : r.photos.length}</td>
                      <td data-label="Status" style={{ whiteSpace: "normal", color: !ok || out?.state === "failed" ? RED : out?.state === "done" ? "#166534" : "#333333", fontSize: 13 }}>
                        {!ok ? errors.join(" · ") : out?.state === "failed" ? out.error : out?.state === "done" ? "Sent for approval" : out?.state === "sending" ? "Sending…" : "Ready"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
