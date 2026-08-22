"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearToken } from "../lib/auth";
import { apiGet } from "../lib/api";
import Sidebar from "../components/Sidebar";
import type { SellerProfile } from "../lib/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [ready,        setReady]       = useState(false);
  const [sidebarOpen,  setSidebarOpen] = useState(false);
  const [profile,      setProfile]     = useState<SellerProfile | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setReady(true);
    apiGet<SellerProfile>("/seller/profile")
      .then(setProfile)
      .catch((err: Error) => {
        if (err.message === "401") {
          clearToken();
          router.replace("/login");
        }
      });
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
        sellerName={profile?.name}
        brandName={profile?.brandName}
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
