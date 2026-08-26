"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, clearToken, getSellerId, getSession } from "../lib/auth";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready,        setReady]       = useState(false);
  const [sidebarOpen,  setSidebarOpen] = useState(false);
  const [sellerName,   setSellerName]  = useState<string | undefined>();
  const [brandName,    setBrandName]   = useState<string | undefined>();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const session = getSession();
    if (session?.must_change_password && pathname !== '/dashboard/profile') {
      router.replace('/dashboard/profile');
      return;
    }

    setReady(true);

    const id = getSellerId();
    if (!id) return;

    void (async () => {
      const { data, error } = await supabase
        .from('sellers')
        .select('name, brand_name')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        clearToken();
        router.replace("/login");
        return;
      }
      if (data) {
        setSellerName((data.name as string | null) ?? undefined);
        setBrandName((data.brand_name as string | null) ?? undefined);
      }
    })();
  }, [router]);

  if (!ready) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F5F5F5" }}>
        <div className="spin" style={{ width: 32, height: 32, border: "3px solid #EEEEEE", borderTopColor: "#CC0000", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F5F5" }}>
      <Sidebar
        sellerName={sellerName}
        brandName={brandName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-60" style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile top bar */}
        <div
          className="lg:hidden"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "#FFFFFF",
            borderBottom: "1px solid #EEEEEE",
            padding: "0 16px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", display: "flex" }}
          >
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

        <div style={{ padding: "28px 24px", maxWidth: 1100 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
