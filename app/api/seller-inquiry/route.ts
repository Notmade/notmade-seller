import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "../../lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      brand_name?: string;
      contact_name?: string;
      phone?: string;
      email?: string;
      instagram?: string | null;
      category?: string | null;
      capacity?: string | null;
      message?: string | null;
    };

    const { brand_name, contact_name, phone, email, instagram, category, capacity, message } = body;

    if (!brand_name?.trim() || !contact_name?.trim() || !phone?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase.from("seller_inquiries").insert({
      brand_name:   brand_name.trim(),
      contact_name: contact_name.trim(),
      phone:        phone.trim(),
      email:        email.trim().toLowerCase(),
      instagram:    instagram ?? null,
      category:     category ?? null,
      capacity:     capacity ?? null,
      message:      message ?? null,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
