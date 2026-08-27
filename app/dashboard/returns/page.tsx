"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getSellerId } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface ReturnRequest {
  id: string;
  order_id: string | null;
  reason: string | null;
  description: string | null;
  images: string[] | null;
  status: string | null;
  created_at: string;
  orders: {
    order_id: string;
    product_name: string;
    customer_name: string | null;
  } | null;
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending:   { bg: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A", label: "Pending" },
    approved:  { bg: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", label: "Approved" },
    rejected:  { bg: "#FFF5F5", color: "#CC0000", border: "1px solid #FECACA", label: "Rejected" },
    resolved:  { bg: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE", label: "Resolved" },
  };
  const s = map[status ?? ""] ?? { bg: "#F5F5F5", color: "#555", border: "1px solid #EEE", label: status ?? "Unknown" };
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: s.bg, color: s.color, border: s.border }}>
      {s.label}
    </span>
  );
}

export default function ReturnsPage() {
  const router = useRouter();
  const [returns,  setReturns]  = useState<ReturnRequest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selected, setSelected] = useState<ReturnRequest | null>(null);

  const sellerId = getSellerId();

  useEffect(() => {
    if (!sellerId) { clearToken(); router.replace("/login"); return; }

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("return_requests")
          .select("id, order_id, reason, description, images, status, created_at, orders(order_id, product_name, customer_name)")
          .eq("seller_id", sellerId)
          .order("created_at", { ascending: false });

        if (error) {
          if (error.code === "42703" || error.code === "PGRST200") {
            const { data: d2, error: e2 } = await supabase
              .from("return_requests")
              .select("id, order_id, reason, description, images, status, created_at")
              .order("created_at", { ascending: false });
            if (!e2) setReturns((d2 ?? []) as unknown as ReturnRequest[]);
            else setErrorMsg("Could not load returns.");
          } else {
            setErrorMsg(error.message);
          }
        } else {
          const normalized = (data ?? []).map(r => ({
            ...r,
            orders: Array.isArray(r.orders) ? (r.orders[0] ?? null) : r.orders,
          })) as unknown as ReturnRequest[];
          setReturns(normalized);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router, sellerId]);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}>
        <div className="spin" style={{ width: 28, height: 28, border: "3px solid #EEE", borderTopColor: "#CC0000", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Returns</h1>
        <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Return requests for your products</p>
      </div>

      {errorMsg && (
        <div style={{ background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#CC0000" }}>
          {errorMsg}
        </div>
      )}

      {returns.length === 0 && !errorMsg ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "64px 24px", textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px", display: "block", color: "#CCCCCC" }}>
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
          <p style={{ fontSize: 15, color: "#888888", fontWeight: 600 }}>No return requests</p>
          <p style={{ fontSize: 13, color: "#CCCCCC", marginTop: 6 }}>Return requests will appear here when customers initiate them.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {returns.map(r => (
            <div key={r.id} style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    {r.orders?.order_id && (
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111111" }}>#{r.orders.order_id}</span>
                    )}
                    <StatusBadge status={r.status} />
                    <span style={{ fontSize: 12, color: "#AAAAAA" }}>
                      {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {r.orders?.product_name && (
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#333333", marginBottom: 4 }}>{r.orders.product_name}</p>
                  )}

                  {r.orders?.customer_name && (
                    <p style={{ fontSize: 12, color: "#888888", marginBottom: 6 }}>Customer: {r.orders.customer_name}</p>
                  )}

                  {r.reason && (
                    <p style={{ fontSize: 13, color: "#555555", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>Reason: </span>{r.reason}
                    </p>
                  )}

                  {r.description && (
                    <p style={{ fontSize: 13, color: "#777777", marginBottom: 8, lineHeight: 1.6 }}>{r.description}</p>
                  )}

                  {r.images && r.images.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                        Customer Photos
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {r.images.map((src, i) => (
                          <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`Return image ${i + 1}`}
                              style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #EEEEEE", cursor: "pointer" }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelected(selected?.id === r.id ? null : r)}
                  style={{ fontSize: 12, fontWeight: 600, color: "#CC0000", background: "none", border: "none", cursor: "pointer", padding: "4px 0", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {selected?.id === r.id ? "Collapse" : "View Details"}
                </button>
              </div>

              {selected?.id === r.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F5F5F5" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                    {r.order_id && (
                      <div>
                        <p style={{ fontSize: 11, color: "#AAAAAA", marginBottom: 2 }}>Order Reference</p>
                        <p style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>{r.order_id}</p>
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 11, color: "#AAAAAA", marginBottom: 2 }}>Return Status</p>
                      <p style={{ fontSize: 13, color: "#333", fontWeight: 600, textTransform: "capitalize" }}>{r.status ?? "—"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#AAAAAA", marginBottom: 2 }}>Requested On</p>
                      <p style={{ fontSize: 13, color: "#333" }}>
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {!r.description && !r.reason && (
                    <p style={{ fontSize: 13, color: "#AAAAAA", marginTop: 12 }}>No additional details provided.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
