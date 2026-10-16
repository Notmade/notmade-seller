"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSeller } from "../lib/useSeller";
import { canOpenRoute, sellerCountry } from "../lib/currency";
import { SellerContext, SellerReloadContext } from "./seller-context";
import Sidebar from "../components/Sidebar";
import NotificationsBell from "../components/NotificationsBell";
import { Alert, Button, Spinner } from "../components/portal-ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, reload, signOut } = useSeller();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const seller = state.status === "ready" ? state.seller : null;
  const approved = seller?.onboarding_status === "approved";
  // UAE-based sellers have no India-only pages (India-to-UAE, India contract, India pickup address)
  const routeOk = canOpenRoute(seller, pathname);

  // Anyone not yet approved finishes (or waits on) onboarding first
  useEffect(() => {
    if (state.status === "ready" && !approved) router.replace("/onboarding");
  }, [state.status, approved, router]);
  useEffect(() => {
    if (seller && approved && !routeOk) router.replace("/dashboard");
  }, [seller, approved, routeOk, router]);

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

  if (!seller || !approved || !routeOk) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F5F5F5" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <SellerReloadContext.Provider value={reload}>
    <SellerContext.Provider value={seller}>
      {/* body text is the landing page's cream (#E8E4DC); the light panel sets its own ink */}
      <div style={{ display: "flex", minHeight: "100vh", background: "#F5F5F5", color: "#111111" }}>
        <Sidebar
          sellerName={seller.contact_name ?? undefined}
          brandName={seller.business_name ?? seller.brand_name ?? undefined}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={signOut}
          showUae={sellerCountry(seller) === "IN"}
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
            <NotificationsBell />
          </div>

          <div style={{ padding: "28px 16px", maxWidth: 1180 }} className="lg:px-6">
            <div className="hidden lg:flex" style={{ justifyContent: "flex-end", marginBottom: 4, marginTop: -12 }}>
              <NotificationsBell />
            </div>
            {seller.agreement?.resign_required && pathname !== "/dashboard/agreement" && (
              <div role="alert" style={{
                display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap",
                background: "#FFF7E6", border: "1px solid #F5D08A", borderRadius: 10, padding: "12px 16px", marginBottom: 20,
              }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#7A4B00" }}>Please review and sign the updated agreement</p>
                  <p style={{ fontSize: 13, color: "#8A6A2E", marginTop: 2 }}>
                    Until you sign, you can&apos;t add or edit products. Your live products stay live and existing orders continue.
                  </p>
                </div>
                <Link href="/dashboard/agreement" style={{ fontSize: 14, fontWeight: 700, color: "#CC0000", textDecoration: "none", whiteSpace: "nowrap" }}>
                  Review &amp; sign →
                </Link>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </SellerContext.Provider>
    </SellerReloadContext.Provider>
  );
}
