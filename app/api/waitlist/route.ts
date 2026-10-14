import { NextRequest, NextResponse } from "next/server";
import { isMarketCode } from "@/src/config/markets";

// Seller waitlist → the storefront's newsletter endpoint (POST /app/newsletter/subscribe on the backend),
// tagged with source "seller-waitlist-{market}". Proxied here so the browser never needs backend CORS.

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; market?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!isMarketCode(body?.market)) return NextResponse.json({ error: "Unknown country." }, { status: 400 });

  try {
    const res = await fetch(`${API_URL}/app/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: `seller-waitlist-${body.market}` }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    const err = String(data.error || data.message || "");
    // Already subscribed is fine: they are on the list
    if (res.ok || res.status === 409 || /already/i.test(err)) return NextResponse.json({ ok: true });
    console.error("[waitlist] backend refused:", res.status, err);
    return NextResponse.json({ error: "Could not join the waitlist. Try again in a minute." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Could not join the waitlist. Try again in a minute." }, { status: 502 });
  }
}
