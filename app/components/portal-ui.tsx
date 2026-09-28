"use client";

import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from "react";

// Small shared building blocks for the seller portal (light theme, matches the existing dashboard).

export const RED = "#CC0000";

export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <div className="spin" role="status" aria-label="Loading"
      style={{ width: size, height: size, border: "3px solid #EEEEEE", borderTopColor: RED, borderRadius: "50%" }} />
  );
}

export function FullPageSpinner() {
  return (
    <div style={{ display: "flex", minHeight: "60vh", alignItems: "center", justifyContent: "center" }}>
      <Spinner size={32} />
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "22px 22px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)", ...style,
    }}>{children}</div>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>{title}</h1>
        {sub && <p style={{ fontSize: 14, color: "#777777", marginTop: 4 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({ variant = "primary", style, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: rest.disabled ? "not-allowed" : "pointer",
    opacity: rest.disabled ? 0.55 : 1, transition: "background 0.15s, color 0.15s", border: "1.5px solid transparent",
    fontFamily: "inherit", whiteSpace: "nowrap",
  };
  const variants: Record<Variant, CSSProperties> = {
    primary:   { background: RED, color: "#FFFFFF" },
    secondary: { background: "#FFFFFF", color: "#111111", borderColor: "#DDDDDD" },
    ghost:     { background: "transparent", color: "#555555" },
    danger:    { background: "#FFFFFF", color: RED, borderColor: "#F3C4C4" },
  };
  return <button type="button" {...rest} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

export function Field({ label, hint, error, children, htmlFor }: {
  label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333333", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && !error && <p style={{ fontSize: 12, color: "#999999", marginTop: 5 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: RED, marginTop: 5 }}>{error}</p>}
    </div>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "success" | "info" | "warn"; children: ReactNode }) {
  const map = {
    error:   { background: "#FFF5F5", color: "#B00000", border: "1px solid #FECACA" },
    success: { background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
    info:    { background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" },
    warn:    { background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" },
  }[kind];
  return <div role={kind === "error" ? "alert" : "status"} style={{ ...map, borderRadius: 10, padding: "11px 14px", fontSize: 14, lineHeight: 1.5 }}>{children}</div>;
}

const BADGE: Record<string, CSSProperties> = {
  pending:          { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" },
  confirmed:        { background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" },
  processing:       { background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" },
  packed:           { background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" },
  shipped:          { background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" },
  dispatched:       { background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" },
  delivered:        { background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
  approved:         { background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
  live:             { background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
  cancelled:        { background: "#FFF5F5", color: RED, border: "1px solid #FECACA" },
  rejected:         { background: "#FFF5F5", color: RED, border: "1px solid #FECACA" },
};

export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
      textTransform: "capitalize", whiteSpace: "nowrap",
      ...(BADGE[status] ?? { background: "#F5F5F5", color: "#555555", border: "1px solid #E5E5E5" }),
    }}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <Card style={{ textAlign: "center", padding: "48px 22px" }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#111111" }}>{title}</p>
      {sub && <p style={{ fontSize: 14, color: "#888888", marginTop: 6 }}>{sub}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </Card>
  );
}

export function Modal({ title, onClose, children, width = 640 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: width, padding: "22px 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111111" }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "#888888", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
