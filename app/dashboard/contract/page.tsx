"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiFetch } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import type { ContractInfo, SellerProfile } from "../../lib/types";

const COMPANY = {
  name:      "House of Notmade Studio Private Limited",
  cin:       "U62099UW2026PTC256850",
  gstin:     "09ABAFH8658N",
  address:   "GK-II/41/C-2, Second Floor, Gyan Khand-2, Shipra Sun City, Indirapuram, Ghaziabad, Uttar Pradesh 201014",
};

function Badge({ status }: { status: ContractInfo["status"] }) {
  const map = {
    pending_signature: { bg: "#FFFBEB", color: "#B45309", label: "Pending Your Signature" },
    signed:            { bg: "#EFF6FF", color: "#1E40AF", label: "Signed — Under Review" },
    active:            { bg: "#F0FDF4", color: "#166534", label: "Active" },
  };
  const s = map[status];
  return (
    <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 100, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function ContractPage() {
  const router   = useRouter();
  const [contract,  setContract]  = useState<ContractInfo | null>(null);
  const [profile,   setProfile]   = useState<SellerProfile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [file,      setFile]      = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadOk,  setUploadOk]  = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  useEffect(() => {
    Promise.allSettled([
      apiGet<ContractInfo>("/seller/contract"),
      apiGet<SellerProfile>("/seller/profile"),
    ]).then(([cr, pr]) => {
      if (cr.status === "fulfilled") setContract(cr.value);
      if (pr.status === "fulfilled") setProfile(pr.value);
      if (cr.status === "rejected" && (cr.reason as Error).message === "401") {
        clearToken(); router.replace("/login");
      }
    }).finally(() => setLoading(false));
  }, [router]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadErr("");
    try {
      const fd = new FormData();
      fd.append("signed_contract", file);
      const res = await apiFetch("/seller/contract/sign", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `Error ${res.status}`);
      }
      setContract(prev => prev ? { ...prev, status: "signed" } : prev);
      setUploadOk(true);
      setFile(null);
    } catch (err: unknown) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}>
        <div className="spin" style={{ width: 28, height: 28, border: "3px solid #EEE", borderTopColor: "#CC0000", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Seller Contract</h1>
          <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Your agreement with NOTMADE</p>
        </div>
        {contract && <Badge status={contract.status} />}
      </div>

      {/* Contract document */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #EEEEEE",
          borderRadius: 14,
          padding: "32px 28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          marginBottom: 20,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "2px solid #111111" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111111", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
            Seller Agreement
          </h2>
          <p style={{ fontSize: 13, color: "#888888", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
            Effective Date: {contract?.generatedAt ? new Date(contract.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : today}
          </p>
        </div>

        {/* Parties */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333333" }}>
            This Seller Agreement (&ldquo;Agreement&rdquo;) is entered into between:
          </p>

          <div style={{ background: "#F7F7F7", borderRadius: 10, padding: "16px 20px", margin: "16px 0", borderLeft: "3px solid #CC0000" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 6, fontFamily: "var(--font-inter), Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Party A — Company
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#333333" }}>
              <strong>{COMPANY.name}</strong><br />
              CIN: {COMPANY.cin}<br />
              GSTIN: {COMPANY.gstin}<br />
              Registered: {COMPANY.address}<br />
              (hereinafter &ldquo;<strong>NOTMADE</strong>&rdquo; or &ldquo;<strong>Company</strong>&rdquo;)
            </p>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: 10, padding: "16px 20px", borderLeft: "3px solid #111111" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 6, fontFamily: "var(--font-inter), Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Party B — Seller
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#333333" }}>
              <strong>{profile?.name ?? "[Seller Name]"}</strong><br />
              Trading as: <strong>{profile?.brandName ?? "[Brand Name]"}</strong><br />
              Email: {profile?.email ?? "[Email]"}<br />
              Phone: {profile?.phone ?? "[Phone]"}<br />
              (hereinafter &ldquo;<strong>Seller</strong>&rdquo;)
            </p>
          </div>
        </div>

        {/* Clauses */}
        {[
          {
            num: "1",
            title: "Commission",
            body: [
              "The Seller agrees to pay the Company a commission of 17% (seventeen percent) of the final selling price of each product sold through the NOTMADE platform.",
              "This commission covers all platform services including marketing, delivery, customer support, returns management, and payment collection.",
              "No monthly fees, subscription charges, listing fees, or any other charges are applicable under this Agreement.",
            ],
          },
          {
            num: "2",
            title: "Payment Terms",
            body: [
              "The Company shall transfer the Seller's earnings (final selling price minus 17% commission) within 7 (seven) business days of successful delivery confirmation.",
              "Payments shall be transferred to the bank account registered in the Seller's profile on the NOTMADE Seller Portal.",
            ],
          },
          {
            num: "3",
            title: "Delivery Policy",
            body: [
              "All deliveries facilitated by NOTMADE are video-verified. The Seller acknowledges and agrees to this video-verified delivery policy.",
              "The Seller shall ensure products are ready for pickup from their registered warehouse address within 24 hours of receiving a pickup notification.",
            ],
          },
          {
            num: "4",
            title: "Product Quality & Compliance",
            body: [
              "The Seller represents that all products listed are accurately described, authentic, and comply with applicable laws.",
              "Product listings are subject to approval by the Company. The Company reserves the right to remove any listing that does not meet quality standards.",
            ],
          },
          {
            num: "5",
            title: "Term and Termination",
            body: [
              "This Agreement commences on the effective date and continues until terminated by either party.",
              "Either party may terminate this Agreement with 30 (thirty) days' written notice.",
              "Upon termination, the Company shall settle all outstanding payments within 14 (fourteen) days.",
            ],
          },
          {
            num: "6",
            title: "Governing Law",
            body: [
              "This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Ghaziabad, Uttar Pradesh.",
            ],
          },
        ].map(({ num, title, body }) => (
          <div key={num} style={{ marginBottom: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111111", marginBottom: 10, fontFamily: "var(--font-inter), Inter, sans-serif" }}>
              {num}. {title.toUpperCase()}
            </h3>
            {body.map((clause, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.8, color: "#444444", marginBottom: 8 }}>
                {num}.{i + 1} {clause}
              </p>
            ))}
          </div>
        ))}

        {/* Signatures */}
        <div style={{ borderTop: "1px solid #DDDDDD", paddingTop: 24, marginTop: 24 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#111111", fontFamily: "var(--font-inter), Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                For NOTMADE
              </p>
              <div style={{ borderBottom: "1px solid #DDDDDD", marginBottom: 8, height: 32 }} />
              <p style={{ fontSize: 12, color: "#888888" }}>Authorized Signatory</p>
              <p style={{ fontSize: 12, color: "#888888" }}>{COMPANY.name}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#111111", fontFamily: "var(--font-inter), Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                For Seller
              </p>
              <div style={{ borderBottom: "1px solid #DDDDDD", marginBottom: 8, height: 32 }} />
              <p style={{ fontSize: 12, color: "#888888" }}>{profile?.name ?? "Seller Name"}</p>
              <p style={{ fontSize: 12, color: "#888888" }}>{profile?.brandName ?? "Brand Name"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "22px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 6 }}>
          {contract?.status === "active" ? "Contract Active" : "Sign & Return"}
        </h2>
        <p style={{ fontSize: 13, color: "#888888", marginBottom: 18 }}>
          {contract?.status === "active"
            ? "Your contract is active. Download your signed copy below."
            : contract?.status === "signed"
            ? "Your signed copy has been received. NOTMADE is reviewing it."
            : "Download the contract, sign it, and upload the signed copy below."}
        </p>

        {/* Download */}
        {contract?.contractUrl && (
          <a
            href={contract.contractUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#111111",
              border: "1.5px solid #E0E0E0",
              textDecoration: "none",
              marginRight: 10,
              marginBottom: 12,
              background: "#FAFAFA",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download Contract PDF
          </a>
        )}

        {/* Upload signed */}
        {(contract?.status === "pending_signature" || !contract) && !uploadOk && (
          <div style={{ marginTop: 4 }}>
            <label
              htmlFor="signed-contract"
              className={`file-drop${file ? " selected" : ""}`}
              style={{ display: "inline-flex", maxWidth: 400 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: file ? "rgba(204,0,0,0.08)" : "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={file ? "#CC0000" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {file ? <path d="M20 6L9 17l-5-5" /> : <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>}
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: file ? "#CC0000" : "#111111" }}>
                  {file ? file.name : "Upload Signed Contract"}
                </p>
                <p style={{ fontSize: 12, color: "#888888", marginTop: 2 }}>
                  {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "PDF only"}
                </p>
              </div>
            </label>
            <input id="signed-contract" type="file" accept=".pdf" className="sr-only" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)} />

            {file && (
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary"
                  style={{ borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer", border: "none", opacity: uploading ? 0.6 : 1 }}
                >
                  {uploading ? "Uploading…" : "Submit Signed Contract →"}
                </button>
              </div>
            )}

            {uploadErr && (
              <p style={{ fontSize: 13, color: "#CC0000", marginTop: 10 }}>{uploadErr}</p>
            )}
          </div>
        )}

        {uploadOk && (
          <p style={{ fontSize: 14, color: "#166534", fontWeight: 600 }}>
            ✓ Signed contract received. We&apos;ll activate your account shortly.
          </p>
        )}

        {contract?.signedUrl && (
          <a
            href={contract.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#888888", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            View your signed copy
          </a>
        )}
      </div>
    </>
  );
}
