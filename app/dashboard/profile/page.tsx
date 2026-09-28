"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { api, DOC_LABELS, fmtDate, type SellerDocument } from "../../lib/seller-api";
import { useDashboardSeller } from "../seller-context";
import { Alert, Button, Card, PageHeader, Spinner } from "../../components/portal-ui";

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
            <Row label="Mobile" value={seller.phone && `+91 ${seller.phone}`} />
            <Row label="Pickup address" value={[seller.address_line, seller.city, seller.state, seller.pincode].filter(Boolean).join(", ")} />
          </dl>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Tax, pricing & agreement</h2>
          <dl style={{ margin: 0 }}>
            {seller.gst_registered
              ? <Row label="GSTIN" value={seller.gstin} />
              : <Row label="Aadhaar" value={seller.aadhaar_last4 && `•••• •••• ${seller.aadhaar_last4}`} />}
            <Row label="PAN" value={seller.pan_number} />
            <Row label="Pricing model" value={seller.pricing_model === "managed" ? "Managed by NOTMADE" : seller.pricing_model === "seller_controlled" ? "Seller controlled" : null} />
            <Row label="Commission" value={seller.commission_rate != null && `${seller.commission_rate}%`} />
            {seller.sell_in_uae && <Row label="UAE commission" value={seller.uae_commission_rate != null ? `${seller.uae_commission_rate}%` : "Enabled"} />}
            <Row label="Agreement signed" value={fmtDate(seller.agreement_signed_at)} />
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
