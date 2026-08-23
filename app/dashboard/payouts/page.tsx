"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getSellerId } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

interface PayoutRow {
  id: string;
  payout_amount: number;
  commission_amount: number;
  status: 'pending' | 'paid';
  payout_due_date: string;
  paid_at: string | null;
  invoice_url: string | null;
  created_at: string;
}

function Badge({ status, isReady }: { status: PayoutRow["status"]; isReady?: boolean }) {
  if (status === 'paid') {
    return <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>Paid</span>;
  }
  if (isReady) {
    return <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" }}>Ready</span>;
  }
  return <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}>Pending</span>;
}

export default function PayoutsPage() {
  const router = useRouter();
  const [payouts,  setPayouts]  = useState<PayoutRow[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const sellerId = getSellerId();
    if (!sellerId) { clearToken(); router.replace("/login"); return; }

    void (async () => {
      try {
        const { data } = await supabase
          .from('seller_payouts')
          .select('id, payout_amount, commission_amount, status, payout_due_date, paid_at, invoice_url, created_at')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });
        setPayouts((data ?? []) as PayoutRow[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const now = new Date();
  const pendingPayouts = payouts.filter(p => p.status === 'pending' && new Date(p.payout_due_date) > now);
  const readyPayouts   = payouts.filter(p => p.status === 'pending' && new Date(p.payout_due_date) <= now);
  const paidPayouts    = payouts.filter(p => p.status === 'paid');

  const pendingAmt = pendingPayouts.reduce((s, p) => s + Number(p.payout_amount), 0);
  const readyAmt   = readyPayouts.reduce((s, p) => s + Number(p.payout_amount), 0);
  const paidAmt    = paidPayouts.reduce((s, p) => s + Number(p.payout_amount), 0);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}>
        <div className="spin" style={{ width: 28, height: 28, border: "3px solid #EEE", borderTopColor: "#CC0000", borderRadius: "50%" }} />
      </div>
    );
  }

  const SectionTable = ({ rows, isReady = false }: { rows: PayoutRow[]; isReady?: boolean }) => {
    if (rows.length === 0) return (
      <p style={{ fontSize: 13, color: "#AAAAAA", textAlign: "center", padding: "24px 0" }}>Nothing here yet.</p>
    );
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
              {["Date", "Payout", "Commission", "Due By", "Status", "Invoice"].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#888888", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                <td style={{ padding: "13px 10px", color: "#333333", whiteSpace: "nowrap" }}>
                  {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "13px 10px", fontWeight: 700, color: p.status === 'paid' ? "#166534" : "#111111" }}>
                  {fmt(Number(p.payout_amount))}
                </td>
                <td style={{ padding: "13px 10px", color: "#CC0000" }}>
                  −{fmt(Number(p.commission_amount))}
                </td>
                <td style={{ padding: "13px 10px", color: "#555", whiteSpace: "nowrap" }}>
                  {p.paid_at
                    ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    : new Date(p.payout_due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </td>
                <td style={{ padding: "13px 10px" }}>
                  <Badge status={p.status} isReady={isReady} />
                </td>
                <td style={{ padding: "13px 10px" }}>
                  {p.invoice_url ? (
                    <a href={p.invoice_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#CC0000", textDecoration: "underline", textUnderlineOffset: "3px", fontWeight: 500 }}>
                      Download
                    </a>
                  ) : (
                    <span style={{ fontSize: 12, color: "#CCCCCC" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Payouts</h1>
        <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Your earnings and payout history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 12, color: "#888888", fontWeight: 500, marginBottom: 8 }}>Pending</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#B45309", letterSpacing: "-0.02em" }}>{fmt(pendingAmt)}</p>
          <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 6 }}>Within 7-day window</p>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", borderLeft: "3px solid #1E40AF", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 12, color: "#888888", fontWeight: 500, marginBottom: 8 }}>Ready to Transfer</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#1E40AF", letterSpacing: "-0.02em" }}>{fmt(readyAmt)}</p>
          <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 6 }}>Due — transfer in progress</p>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 12, color: "#888888", fontWeight: 500, marginBottom: 8 }}>Total Paid Out</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#166534", letterSpacing: "-0.02em" }}>{fmt(paidAmt)}</p>
          <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 6 }}>Lifetime earnings transferred</p>
        </div>
      </div>

      {/* Sections */}
      {readyPayouts.length > 0 && (
        <div style={{ background: "#FFFFFF", border: "1.5px solid #BFDBFE", borderRadius: 14, padding: "20px 22px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1E40AF", marginBottom: 16 }}>Ready for Transfer ({readyPayouts.length})</h2>
          <SectionTable rows={readyPayouts} isReady />
        </div>
      )}

      <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 16 }}>Pending ({pendingPayouts.length})</h2>
        <SectionTable rows={pendingPayouts} />
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 16 }}>Paid Out ({paidPayouts.length})</h2>
        <SectionTable rows={paidPayouts} />
      </div>

      <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 16, textAlign: "center" }}>
        17% commission per sale · Payouts within 7 days of delivery · No hidden deductions
      </p>
    </>
  );
}
