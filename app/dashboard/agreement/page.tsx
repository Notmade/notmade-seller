"use client";

import { useCallback, useEffect, useState } from "react";
import { api, downloadAgreement, fmtTimestamp, type SignedAgreement } from "../../lib/seller-api";
import { useDashboardSeller, useReloadSeller } from "../seller-context";
import { Alert, Button, Card, PageHeader, PageSkeleton, RED } from "../../components/portal-ui";
import { AgreementDocument, AgreementSigner } from "../../components/AgreementSigner";

export default function AgreementPage() {
  const seller = useDashboardSeller();
  const reloadSeller = useReloadSeller();
  const status = seller.agreement;
  const [signed, setSigned] = useState<SignedAgreement[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const r = await api.signedAgreements();
      setSigned(r.agreements);
      setOpen(o => o ?? r.agreements[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your agreements");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const onSigned = async () => {
    await reloadSeller();
    setOpen(null);
    await load();
  };

  return (
    <div>
      <PageHeader title="Agreement" sub="Your agreements with NOTMADE. You set your own prices; NOTMADE never changes your price." />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {status?.resign_required && (
          <>
            <Alert kind="warn">
              The NOTMADE Seller Agreement has been updated to version <strong>{status.required_version}</strong> (you signed {status.signed_version}).
              Please review and sign it. Until you do, you can&apos;t add or edit products; your live products and existing orders are not affected.
            </Alert>
            <AgreementSigner seller={seller} load={api.agreement} sign={api.signAgreement} onSigned={onSigned} />
          </>
        )}

        {error ? (
          <Alert>{error} <button type="button" onClick={() => void load()} style={{ color: RED, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Retry</button></Alert>
        ) : !signed ? <PageSkeleton stats={0} rows={2} /> : signed.length === 0 ? (
          <Card><p style={{ fontSize: 14, color: "#888888" }}>No signed agreements on file.</p></Card>
        ) : signed.map(a => (
          <Card key={a.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111111" }}>{a.title}</h2>
                <p style={{ fontSize: 13, color: "#888888", marginTop: 2 }}>
                  Version {a.version} · signed by {a.signer_name} on {fmtTimestamp(a.signed_at)}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" onClick={() => setOpen(open === a.id ? null : a.id)}>{open === a.id ? "Hide" : "View"}</Button>
                <Button variant="secondary" onClick={() => downloadAgreement(a.plain_text, a.title, a.version)}>Download</Button>
              </div>
            </div>
            {open === a.id && (
              <div style={{ marginTop: 14 }}>
                <AgreementDocument html={a.html} maxHeight={560} />
                <p style={{ fontSize: 11, color: "#AAAAAA", marginTop: 8, wordBreak: "break-all" }}>SHA-256 {a.agreement_hash}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
