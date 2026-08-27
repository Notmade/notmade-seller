"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "../lib/auth";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    href: "/dashboard/payouts",
    label: "Payouts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/warehouse",
    label: "Warehouse",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/dashboard/contract",
    label: "Contract",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/dashboard/returns",
    label: "Returns",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      </svg>
    ),
  },
] as const;

interface Props {
  sellerName?: string;
  brandName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ sellerName, brandName, isOpen, onClose }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const handleLogout = async () => {
    clearToken();
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    router.push("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: 240, background: "#FFFFFF", borderRight: "1px solid #EEEEEE" }}
      >
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #EEEEEE" }}>
          <span style={{ fontSize: "1.125rem", fontWeight: 900, letterSpacing: "-0.02em", userSelect: "none" }}>
            <span style={{ color: "#111111" }}>NOT</span>
            <span style={{ color: "#CC0000" }}>MADE</span>
          </span>
          <p style={{ fontSize: "10px", color: "#888888", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "3px" }}>
            Seller Portal
          </p>
        </div>

        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px",
                  margin: "1px 8px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#CC0000" : "#555555",
                  background: active ? "rgba(204,0,0,0.06)" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ color: active ? "#CC0000" : "#AAAAAA", flexShrink: 0 }}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid #EEEEEE" }}>
          {(brandName || sellerName) && (
            <div style={{ marginBottom: 10, padding: "0 4px" }}>
              {brandName && (
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {brandName}
                </p>
              )}
              {sellerName && (
                <p style={{ fontSize: 12, color: "#888888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {sellerName}
                </p>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#888888",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FFF5F5"; e.currentTarget.style.color = "#CC0000"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888888"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
