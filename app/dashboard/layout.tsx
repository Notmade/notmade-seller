"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api, type DashboardData } from "../lib/seller-api";
import { useSeller } from "../lib/useSeller";
import { canOpenRoute, sellerCountry } from "../lib/currency";
import { LiveContext, SellerContext, SellerReloadContext } from "./seller-context";
import Sidebar, { BottomNav } from "../components/Sidebar";
import NotificationsBell from "../components/NotificationsBell";
import { CountryBadge } from "../components/market";
import { Alert, Button, PageSkeleton } from "../components/portal-ui";

/** One poll for the whole panel: the new-order badge and Overview read the same numbers. */
function useLivePanel(enabled: boolean) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try { setData(await api.dashboard()); setError(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load dashboard"); }
  }, []);
  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const t = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 60_000);
    return () => clearInterval(t);
  }, [enabled, refresh]);
  return { data, error, refresh };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, reload, signOut } = useSeller();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const seller = state.status === "ready" ? state.seller : null;
  const approved = seller?.onboarding_status === "approved";
  const routeOk = canOpenRoute(seller, pathname);
  const live = useLivePanel(!!approved);

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
    return <div style={{ minHeight: "100vh", background: "#F5F5F5", color: "#111111", padding: "28px 16px", maxWidth: 1180, margin: "0 auto" }}><PageSkeleton /></div>;
  }

  const country = sellerCountry(seller);
  const newOrders = live.data?.counts.new ?? 0;

  return (
    <SellerReloadContext.Provider value={reload}>
    <SellerContext.Provider value={seller}>
    <LiveContext.Provider value={live}>
      {/* body text is the landing page's cream (#E8E4DC); the light panel sets its own ink */}
      <div style={{ display: "flex", minHeight: "100vh", background: "#F5F5F5", color: "#111111" }}>
        <Sidebar
          sellerName={seller.contact_name ?? undefined}
          brandName={seller.business_name ?? seller.brand_name ?? undefined}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={signOut}
          newOrders={newOrders}
        />

        <div className="lg:ml-60" style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile top bar */}
          <div
            className="sp-topbar"
          >
            <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              <span style={{ color: "#111111" }}>NOT</span>
              <span style={{ color: "#CC0000" }}>MADE</span>
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CountryBadge country={country} />
              <NotificationsBell />
            </div>
          </div>

          <div style={{ padding: "28px 16px", maxWidth: 1180 }} className="lg:px-6 sp-page">
            <div className="hidden lg:flex" style={{ justifyContent: "flex-end", alignItems: "center", gap: 10, marginBottom: 4, marginTop: -12 }}>
              <CountryBadge country={country} />
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
        <BottomNav newOrders={newOrders} onMore={() => setSidebarOpen(true)} />
      </div>
    </LiveContext.Provider>
    </SellerContext.Provider>
    </SellerReloadContext.Provider>
  );
}
