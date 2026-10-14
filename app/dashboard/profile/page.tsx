"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { api, DOC_LABELS, fmtDate, type SellerDocument } from "../../lib/seller-api";
import { useDashboardSeller } from "../seller-context";
import { Alert, Button, Card, PageHeader, RED, Spinner } from "../../components/portal-ui";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #F3F3F3", flexWrap: "wrap" }}>
      <dt style={{ width: 180, fontSize: 13, color: "#888888", flexShrink: 0 }}>{label}</dt>
      <dd style={{ flex: 1, minWidth: 160, fontSize: 14, color: "#111111", margin: 0, wordBreak: "break-word" }}>{value || "—"}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const seller = useDashboardSeller();
  const uae = seller.uae;
  const uaeBased = seller.seller_country === "AE";
  const agreement = seller.agreement;
  const commission = seller.commission;
  const pct = (n: number | null | undefined) => (n == null ? null : `${n}%`);
  const [docs, setDocs] = useState<SellerDocument[] | null>(null);
  const [docsErr, setDocsErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [logoMsg, setLogoMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const loadDocs = () => api.documents().then(r => setDocs(r.documents)).catch(err => setDocsErr(err instanceof Error ? err.message : "Could not load documents"));
  useEffect(() => { void loadDocs(); }, []);

  const uploadLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true); setLogoMsg(null);
    try {
      await api.uploadDocument("logo", file);
      setLogoMsg({ kind: "success", text: "Logo uploaded." });
      void loadDocs();
    } catch (err) {
      setLogoMsg({ kind: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" sub="Details verified during onboarding. To change them, email admin@notmade.in." />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Business</h2>
          <dl style={{ margin: 0 }}>
            <Row label="Brand / store name" value={seller.business_name} />
            <Row label="Legal name" value={seller.legal_name} />
            <Row label="Contact person" value={seller.contact_name} />
            <Row label="Email" value={seller.email} />
            <Row label="Business based in" value={uaeBased ? "UAE" : "India"} />
            <Row label="Mobile" value={seller.phone && (uaeBased ? seller.phone : `+91 ${seller.phone}`)} />
            <Row label={uaeBased ? "Business address" : "Pickup address"} value={[seller.address_line, seller.city, uaeBased ? seller.emirate : seller.state, seller.pincode].filter(Boolean).join(", ")} />
          </dl>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Tax, pricing & agreement</h2>
          <dl style={{ margin: 0 }}>
            {uaeBased ? <>
              <Row label="Trade licence" value={seller.trade_licence_number} />
              <Row label="TRN" value={seller.trn || "Not VAT registered"} />
              <Row label="ID document" value={seller.uae_id_type === "passport" ? "Passport" : seller.emirates_id_last4 && `Emirates ID •••• ${seller.emirates_id_last4}`} />
              <Row label="IBAN" value={seller.iban && `${seller.iban.slice(0, 4)} •••• ${seller.iban.slice(-4)}`} />
            </> : <>
              {seller.gst_registered
                ? <Row label="GSTIN" value={seller.gstin} />
                : <Row label="Aadhaar" value={seller.aadhaar_last4 && `•••• •••• ${seller.aadhaar_last4}`} />}
              <Row label="PAN" value={seller.pan_number} />
            </>}
            <Row label="Pricing" value="Seller-controlled. You set your own prices; NOTMADE never changes your price." />
            {uaeBased
              ? <Row label="UAE store commission" value={pct(commission?.international_pct ?? uae?.commission_pct)} />
              : <>
                <Row label="India store commission" value={pct(commission?.india_pct ?? seller.commission_rate)} />
                <Row label="International commission" value={pct(commission?.international_pct ?? uae?.commission_pct)} />
              </>}
            <Row label="Seller agreement" value={agreement?.signed_version
              ? <>
                {agreement.signed_version} · signed {fmtDate(agreement.signed_at)}
                {agreement.resign_required && <span style={{ color: RED, fontWeight: 700 }}> · update to {agreement.required_version} needs your signature</span>}
              </>
              : fmtDate(seller.agreement_signed_at)} />
            {!uaeBased && <Row label="International addendum" value={uae?.signed_agreement_version
              ? `${uae.signed_agreement_version} · signed ${fmtDate(uae.signed_at)}`
              : "Not signed"} />}
            <Row label="Agreement text" value={<Link href="/dashboard/agreement" style={{ color: RED, fontWeight: 700, textDecoration: "none" }}>View agreement →</Link>} />
            <Row label="Seller since" value={fmtDate(seller.created_at)} />
          </dl>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800 }}>Documents</h2>
            <input ref={logoInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadLogo} />
            <Button variant="secondary" disabled={uploading} onClick={() => logoInput.current?.click()}>
              {uploading ? <><Spinner size={14} /> Uploading</> : seller.logo_url ? "Replace logo" : "Upload logo"}
            </Button>
          </div>
          {logoMsg && <div style={{ marginBottom: 10 }}><Alert kind={logoMsg.kind}>{logoMsg.text}</Alert></div>}
          {docsErr ? <Alert>{docsErr}</Alert> : !docs ? <Spinner /> : docs.length === 0 ? (
            <p style={{ fontSize: 14, color: "#888888" }}>No documents on file.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {docs.map(d => (
                <li key={d.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid #F3F3F3", fontSize: 14 }}>
                  <span style={{ color: "#111111" }}>{DOC_LABELS[d.doc_type] ?? d.doc_type}</span>
                  <span style={{ color: "#888888", fontSize: 13 }}>{fmtDate(d.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 10 }}>KYC documents are locked after approval.</p>
        </Card>
      </div>
    </div>
  );
}
