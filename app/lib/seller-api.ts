// Client for the NOTMADE backend seller endpoints (/seller-auth/*, /seller/*).
// Auth is a 30-day seller JWT sent as a Bearer token.

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const TOKEN_KEY = "nm_seller_token";
// Presence-only cookie so middleware can gate routes; the JWT itself never goes in a cookie.
const COOKIE = "nm_seller";

// ─── Session ────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage blocked */ }
  document.cookie = `${COOKIE}=1; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
}

export function clearSession(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ }
  document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax`;
}

// ─── Types (mirror backend responses) ─────────────────────────────────────────

export type OnboardingStatus =
  | "pending_details" | "pending_agreement" | "pending_review" | "approved" | "rejected" | "suspended";

export type OtpPurpose = "login" | "signup" | "agreement";

export interface Seller {
  id: string;
  email: string;
  legal_name: string | null;
  business_name: string | null;
  brand_name: string | null;
  contact_name: string | null;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gst_registered: boolean | null;
  gstin: string | null;
  pan_number: string | null;
  aadhaar_last4: string | null;
  pricing_model: "managed" | "seller_controlled" | null;
  sell_in_uae: boolean | null;
  commission_rate: number | null;
  uae_commission_rate: number | null;
  onboarding_status: OnboardingStatus | null;
  agreement_signed_at: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface VerifyOtpResponse {
  token: string;
  seller_id: string | null;
  onboarding_status: OnboardingStatus;
  is_new: boolean;
}

export type DocType = "gst_certificate" | "aadhaar_front" | "aadhaar_back" | "pan_card" | "logo";

export interface SellerDocument {
  id: string;
  doc_type: DocType;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface OnboardingState {
  onboarding_status: OnboardingStatus;
  next_step: "details" | "documents" | "agreement" | "review" | "done" | "rejected" | "suspended";
  missing_fields: string[];
  required_documents: DocType[];
  uploaded_documents: DocType[];
  missing_documents: DocType[];
  agreement_signed: boolean;
  agreement_signed_at: string | null;
}

export interface Agreement {
  version: string;
  text: string;
  agreement_hash: string;
  pricing_model: string;
  commission_rate: number;
  includes_uae_clause: boolean;
  signed: boolean;
}

export interface Category { id: string; name: string; slug: string }

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  category_id: string | null;
  sizes: string[] | null;
  stock: number | null;
  price_inr: number;
  original_price_inr: number | null;
  price_aed: number | null;
  sell_in_uae: boolean | null;
  images: string[] | null;
  is_live: boolean | null;
  approval_status: "pending" | "approved" | "rejected" | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  product_variants: { size: string; stock: number; is_active: boolean }[] | null;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  ref_no: string;
  status: string;
  payment_method: string | null;
  created_at: string;
  customer_name: string | null;
  city: string | null;
  pincode: string | null;
  items: OrderItem[];
  seller_subtotal: number;
  order_total: number | null;
  multi_seller: boolean;
  seller_status: SellerOrderStatus | null;
  seller_accepted_at: string | null;
  seller_rejected_at: string | null;
  seller_reject_reason: string | null;
  waybill: string | null;
  courier_status: string | null;
  has_unboxing_video: boolean;
  unboxing_video_status: UnboxingVideoStatus | null;
}

export type SellerOrderStatus = "awaiting" | "accepted" | "rejected";
export type UnboxingVideoStatus = "pending_review" | "approved" | "rejected";

export const REJECT_REASONS = ["Out of stock", "Size unavailable", "Quality issue", "Other"] as const;
export type RejectReason = (typeof REJECT_REASONS)[number];

export interface UnboxingVideo {
  url: string | null;
  expires_in: number | null;
  status: UnboxingVideoStatus;
  uploaded_at: string | null;
}

// ─── Request helper ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(status: number, message: string, data: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Network error. Check your connection and try again.", {});
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) });

// ─── Endpoints ──────────────────────────────────────────────────────────────

export const api = {
  sendOtp: (email: string, purpose: OtpPurpose) =>
    post<{ success: true; message: string; expires_in_seconds: number }>("/seller-auth/send-otp", { email, purpose }),
  verifyOtp: (email: string, code: string, purpose: "login" | "signup") =>
    post<VerifyOtpResponse>("/seller-auth/verify-otp", { email, code, purpose }),

  me: () => request<{ seller: Seller }>("/seller/me"),
  signup: (body: Record<string, unknown>) =>
    post<{ seller: Seller; token?: string; required_documents: DocType[] }>("/seller/signup", body),
  onboardingStatus: () => request<OnboardingState>("/seller/onboarding-status"),

  documents: () => request<{ documents: SellerDocument[] }>("/seller/documents"),
  uploadDocument: (docType: DocType, file: File) => {
    const fd = new FormData();
    fd.append("doc_type", docType);
    fd.append("file", file);
    return post<{ document: SellerDocument }>("/seller/documents", fd);
  },

  agreement: () => request<Agreement>("/seller/agreement"),
  signAgreement: (body: { code: string; signer_name: string; agreement_hash: string }) =>
    post<{ agreement: { id: string; version: string; signed_at: string }; onboarding_status: OnboardingStatus }>(
      "/seller/agreement/sign", body),

  categories: () => request<{ categories: Category[] }>("/seller/categories"),
  products: () => request<{ products: Product[] }>("/seller/products"),
  createProduct: (fd: FormData) => post<{ product: Product }>("/seller/products", fd),
  updateProduct: (id: string, fd: FormData) =>
    request<{ product: Product }>(`/seller/products/${id}`, { method: "PUT", body: fd }),
  deleteProduct: (id: string) => request<{ success: true }>(`/seller/products/${id}`, { method: "DELETE" }),

  orders: () => request<{ orders: Order[] }>("/seller/orders"),
  acceptOrder: (refNo: string) => post<{ order: Order }>(`/seller/orders/${encodeURIComponent(refNo)}/accept`),
  rejectOrder: (refNo: string, reason: RejectReason, details?: string) =>
    post<{ order: Order }>(`/seller/orders/${encodeURIComponent(refNo)}/reject`, { reason, details }),
  unboxingVideo: (refNo: string) =>
    request<{ video: UnboxingVideo | null }>(`/seller/orders/${encodeURIComponent(refNo)}/unboxing-video`),
  orderLabel: (refNo: string) =>
    post<{ waybill: string; label_url: string | null; label_pending: boolean }>(
      `/seller/orders/${encodeURIComponent(refNo)}/label`),
};

export const DOC_LABELS: Record<DocType, string> = {
  gst_certificate: "GST certificate",
  aadhaar_front: "Aadhaar (front)",
  aadhaar_back: "Aadhaar (back)",
  pan_card: "PAN card",
  logo: "Brand logo",
};

export function inr(n: number | null | undefined): string {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
