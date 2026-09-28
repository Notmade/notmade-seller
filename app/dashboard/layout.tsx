"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSeller } from "../lib/useSeller";
import { SellerContext } from "./seller-context";
import Sidebar from "../components/Sidebar";
import { Alert, Button, Spinner } from "../components/portal-ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { state, reload, signOut } = useSeller();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const seller = state.status === "ready" ? state.seller : null;
  const approved = seller?.onboarding_status === "approved";

  // Anyone not yet approved finishes (or waits on) onboarding first
  useEffect(() => {
    if (state.status === "ready" && !approved) router.replace("/onboarding");
  }, [state.status, approved, router]);

  if (state.status === "error") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#F5F5F5", padding: 16 }}>
        <div style={{ maxWidth: 420, width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <Alert>{state.message}</Alert>
          <Button onClick={() => void reload()}>Try again</Button>
        </div>
      </div>
    );
  }

  if (!seller || !approved) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F5F5F5" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <SellerContext.Provider value={seller}>
      <div style={{ display: "flex", minHeight: "100vh", background: "#F5F5F5" }}>
        <Sidebar
          sellerName={seller.contact_name ?? undefined}
          brandName={seller.business_name ?? seller.brand_name ?? undefined}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={signOut}
        />

        <div className="lg:ml-60" style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile top bar */}
          <div
            className="lg:hidden"
            style={{
              position: "sticky", top: 0, zIndex: 20, background: "#FFFFFF", borderBottom: "1px solid #EEEEEE",
              padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <button onClick={() => setSidebarOpen(true)} aria-label="Open menu"
              style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              <span style={{ color: "#111111" }}>NOT</span>
              <span style={{ color: "#CC0000" }}>MADE</span>
            </span>
            <div style={{ width: 22 }} />
          </div>

          <div style={{ padding: "28px 16px", maxWidth: 1100 }} className="lg:px-6">
            {children}
          </div>
        </div>
      </div>
    </SellerContext.Provider>
  );
}
