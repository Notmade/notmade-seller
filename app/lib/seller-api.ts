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

export type SellerCountry = "IN" | "AE";

/** UAE selling status from GET /seller/me. commission_pct is the seller's effective UAE rate (settings or override). */
export interface UaeStatus {
  seller_country: SellerCountry;
  ready: boolean;
  required_agreement_version: string;
  signed_agreement_version: string | null;
  signed_at: string | null;
  commission_pct: number | null;
}

/** Main agreement state from GET /seller/me. resign_required: signed an older version than the current one for their country. */
export interface AgreementStatus {
  seller_country: "IN" | "AE" | "OTHER";
  required_version: string | null;
  required_open: boolean;
  signed_version: string | null;
  signed_at: string | null;
  resign_required: boolean;
}

/** Effective rates from GET /seller/me. international_pct: UAE store rate for UAE-based sellers. */
export interface SellerCommission {
  pricing: "seller_controlled";
  india_pct: number | null;
  international_pct: number | null;
}

/** GET /seller/commission-rates — shown at registration. */
export interface CommissionRates {
  india_pct: number | null;
  international_pct: number | null;
  uae_local_pct: number | null;
}

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
  // Migration 045 — absent until it runs
  seller_country?: SellerCountry | null;
  uae_agreement_version?: string | null;
  trade_licence_number?: string | null;
  trn?: string | null;
  uae_id_type?: "emirates_id" | "passport" | null;
  emirates_id_last4?: string | null;
  emirate?: string | null;
  iban?: string | null;
  // Migration 048
  agreement_version?: string | null;
  /** Merged in from GET /seller/me */
  uae?: UaeStatus;
  agreement?: AgreementStatus;
  commission?: SellerCommission;
}

export interface VerifyOtpResponse {
  token: string;
  seller_id: string | null;
  onboarding_status: OnboardingStatus;
  is_new: boolean;
}

export type DocType =
  | "gst_certificate" | "aadhaar_front" | "aadhaar_back" | "pan_card"
  | "trade_licence" | "emirates_id_front" | "emirates_id_back" | "passport" | "logo";

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
  seller_country?: SellerCountry;
}

export interface Agreement {
  version: string;
  title: string;
  /** Signed markdown; agreement_hash covers exactly this */
  text: string;
  /** Sanitised HTML rendered by the backend from `text` */
  html: string;
  /** `text` with all markdown markers removed, for downloads */
  plain_text: string;
  agreement_hash: string;
  pricing_model: string;
  commission_rate: number;
  includes_uae_clause: boolean;
  signed: boolean;
}

export interface UaeAgreementResponse extends UaeStatus {
  agreement: Agreement | null;
}

export type SignBody = { code: string; signer_name: string; agreement_hash: string };

export interface SignedAgreement {
  id: string;
  version: string;
  title: string;
  agreement_hash: string;
  signer_name: string;
  signed_at: string;
  html: string;
  plain_text: string;
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
  /** Options beyond Size (migration 047). Values of non-Size options may carry an ordered gallery. */
  options?: ProductOption[] | null;
  variants?: { id: string; option_values: Record<string, string>; stock: number; stock_uae: number | null; is_active: boolean }[] | null;
}

export interface OptionImage { url: string; jpg_url: string | null }
export interface ProductOption {
  name: string;
  values: { value: string; image_url?: string | null; image_jpg_url?: string | null; images?: OptionImage[] }[];
}

/** One order on the Delivery Timeline page: the orders-page shape plus the delivery promise. */
export interface DeliveryStage { key: string; label: string; at: string | null; due_by: string | null; done: boolean; late: boolean }
export interface DeliveryInfo {
  lane: "uae" | "ncr_express" | "pan_india";
  expected_delivery_at: string;
  expected_from: string | null;
  expected_label: string;
  current_stage: string;
  closed: boolean;
  stages: DeliveryStage[];
  delayed: boolean;
  delay: { stage: string; label: string; due_by: string; overdue_hours: number } | null;
}
export interface DeliveryRules {
  ncr_express: { enabled: boolean; hours: number; window_start: string; window_end: string };
  pan_india: { min_days: number; max_days: number };
  uae: { min_days: number; max_days: number };
  sla_hours: { accept: number; ready: number; pickup: number };
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  /** Variant snapshot: label falls back to the size, image to the product image */
  variant_id: string | null;
  label: string | null;
  image: string | null;
  option_values: Record<string, string>;
  market_unit_price: number | null;
  market_currency: string | null;
}

export type OrderBucket = "new" | "accepted" | "ready" | "shipped" | "delivered" | "cancelled" | "returns";
export type StageKey = "placed" | "accepted" | "ready" | "awb" | "picked_up" | "in_transit" | "delivered";

export interface TimelineStep { key: StageKey; label: string; done: boolean; current: boolean; at: string | null }

/** Commission on this seller's lines: India 17%, UAE local 17%, India to UAE 45% (rates from the backend). */
export interface OrderCommission {
  type: "india" | "uae_local" | "uae_from_india";
  label: string;
  pct: number | null;
  currency: "INR" | "AED";
  gross: number;
  commission: number | null;
  payout: number | null;
  /** true once the rate was locked in at accept */
  snapshot: boolean;
}

export interface Order {
  ref_no: string;
  status: string;
  payment_method: string | null;
  created_at: string;
  customer_name: string | null;
  city: string | null;
  pincode: string | null;
  region: "in" | "ae";
  items: OrderItem[];
  seller_subtotal: number;
  order_total: number | null;
  multi_seller: boolean;
  seller_status: SellerOrderStatus | null;
  seller_accepted_at: string | null;
  seller_rejected_at: string | null;
  seller_reject_reason: string | null;
  cancel_reason: string | null;
  bucket: OrderBucket;
  stage: StageKey;
  timeline: TimelineStep[];
  sla_due_at: string | null;
  ready_at: string | null;
  package_weight_kg: number | null;
  waybill: string | null;
  courier: string | null;
  courier_status: string | null;
  pickup_status: string | null;
  awb_generated_at: string | null;
  label_available: boolean;
  /** Delhivery AWB generated, or (UAE) a courier partner assigned by NOTMADE — tracking number optional */
  courier_assigned?: boolean;
  /** UAE: NOTMADE assigns a courier partner (no Delhivery, no label) */
  manual_courier?: boolean;
  pickup_note?: string | null;
  handed_over_at?: string | null;
  commission: OrderCommission;
  settlement_days: number;
  settlement_date: string | null;
  has_unboxing_video: boolean;
  unboxing_video_status: UnboxingVideoStatus | null;
}

export type SellerOrderStatus = "awaiting" | "accepted" | "rejected";
export type UnboxingVideoStatus = "pending_review" | "approved" | "rejected";

export const REJECT_REASONS = ["Out of stock", "Can't fulfil in time", "Other"] as const;
export type RejectReason = (typeof REJECT_REASONS)[number];

export type Money = Partial<Record<"INR" | "AED", number>>;

export interface DashboardData {
  today: { orders: number; payout: Money };
  pending_accept: { count: number; overdue: number; next_due_at: string | null };
  ready_for_pickup: { count: number; awaiting_awb: number; awb_generated: number };
  counts: Record<OrderBucket, number>;
  earnings: { today: Money; month: Money; delivered_lifetime: Money };
  next_settlement: { date: string; amount: Money; source: "payout" | "estimate" } | null;
  settlement_days: number;
  low_stock: { count: number; threshold: number; items: { product_id: string; name: string; variant: string | null; stock: number; image: string | null }[] };
  returns: { open: number };
  products: { total: number; live: number; pending: number; rejected: number };
  sla_hours: number;
  recent_orders: Order[];
}

export interface SellerNotification {
  id: string;
  type: "new_order" | "reminder" | "awb_ready" | "cancelled" | "payout" | "product";
  urgent: boolean;
  title: string;
  body: string;
  href: string;
  at: string;
}

export interface Payout {
  id: string;
  amount: number;
  commission: number | null;
  currency: "INR" | "AED";
  status: "paid" | "pending";
  due_date: string | null;
  paid_at: string | null;
  reference: string | null;
  invoice_url: string | null;
  created_at: string;
}

export interface UpcomingSettlement {
  ref_no: string; settlement_date: string; currency: "INR" | "AED";
  gross: number; commission: number | null; commission_pct: number | null; payout: number | null;
}

export interface ReturnRequest {
  id: string; order_ref: string | null; product_id: string | null; product_name: string | null;
  type: string; reason: string | null; status: string; size_ordered: string | null; size_requested: string | null;
  has_video: boolean; created_at: string; resolved_at: string | null;
}

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

  me: async () => {
    const r = await request<{ seller: Seller; uae?: UaeStatus; agreement?: AgreementStatus; commission?: SellerCommission }>("/seller/me");
    return { seller: r.seller ? { ...r.seller, uae: r.uae, agreement: r.agreement, commission: r.commission } : r.seller };
  },
  commissionRates: () => request<CommissionRates>("/seller/commission-rates"),
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
  signedAgreements: () => request<{ agreements: SignedAgreement[] }>("/seller/agreements/signed"),
  signAgreement: (body: SignBody) =>
    post<{ agreement: { id: string; version: string; signed_at: string }; onboarding_status: OnboardingStatus }>(
      "/seller/agreement/sign", body),
  uaeAgreement: () => request<UaeAgreementResponse>("/seller/uae-agreement"),
  signUaeAgreement: (body: SignBody) =>
    post<{ agreement: { id: string; version: string; signed_at: string }; uae: UaeStatus }>("/seller/uae-agreement/sign", body),

  categories: () => request<{ categories: Category[] }>("/seller/categories"),
  products: () => request<{ products: Product[] }>("/seller/products"),
  createProduct: (fd: FormData) => post<{ product: Product }>("/seller/products", fd),
  updateProduct: (id: string, fd: FormData) =>
    request<{ product: Product }>(`/seller/products/${id}`, { method: "PUT", body: fd }),
  deleteProduct: (id: string) => request<{ success: true }>(`/seller/products/${id}`, { method: "DELETE" }),

  orders: () => request<{ orders: Order[]; counts: Record<OrderBucket, number>; sla_hours: number }>("/seller/orders"),
  acceptOrder: (refNo: string) => post<{ order: Order }>(`/seller/orders/${encodeURIComponent(refNo)}/accept`),
  rejectOrder: (refNo: string, reason: RejectReason, details: string) =>
    post<{ order: Order }>(`/seller/orders/${encodeURIComponent(refNo)}/reject`, { reason, details }),
  markReady: (refNo: string, weightKg?: number) =>
    post<{ order: Order }>(`/seller/orders/${encodeURIComponent(refNo)}/ready`, weightKg ? { weight_kg: weightKg } : {}),
  dashboard: () => request<DashboardData>("/seller/dashboard"),
  deliveryTimeline: (scope: "open" | "all" = "open") =>
    request<{ rules: DeliveryRules; summary: { open: number; delayed: number; due_today: number }; orders: (Order & { delivery: DeliveryInfo })[] }>(`/seller/delivery-timeline?scope=${scope}`),
  /** Option value image → products bucket. Returns the URL to put in options[].values[].images. */
  uploadVariantImage: (file: File, productId?: string) => {
    const fd = new FormData();
    fd.append("image", file);
    if (productId) fd.append("product_id", productId);
    return post<{ url: string; image_url: string; image_jpg_url: string | null }>("/seller/products/variant-image", fd);
  },
  notifications: () => request<{ notifications: SellerNotification[] }>("/seller/notifications"),
  payouts: () => request<{ payouts: Payout[]; upcoming: UpcomingSettlement[]; totals: { paid: Money; scheduled: Money; upcoming: Money }; settlement_days: number }>("/seller/payouts"),
  returns: () => request<{ returns: ReturnRequest[] }>("/seller/returns"),
  unboxingVideo: (refNo: string) =>
    request<{ video: UnboxingVideo | null }>(`/seller/orders/${encodeURIComponent(refNo)}/unboxing-video`),
  orderLabel: (refNo: string) =>
    post<{ waybill: string; courier?: string; label_url: string | null; label_pending: boolean; manual?: boolean }>(
      `/seller/orders/${encodeURIComponent(refNo)}/label`),
};

export const DOC_LABELS: Record<DocType, string> = {
  gst_certificate: "GST certificate",
  aadhaar_front: "Aadhaar (front)",
  aadhaar_back: "Aadhaar (back)",
  pan_card: "PAN card",
  trade_licence: "Trade licence",
  emirates_id_front: "Emirates ID (front)",
  emirates_id_back: "Emirates ID (back)",
  passport: "Passport",
  logo: "Brand logo",
};

export function aed(n: number | null | undefined): string {
  return `AED ${Number(n || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** What the seller keeps on a UAE sale after commission, rounded to fils. */
export function uaeNet(priceAed: number, commissionPct: number): number {
  return Math.round(priceAed * (1 - commissionPct / 100) * 100) / 100;
}

/** Saves agreement text as a .txt download (plain text, no markdown markers). */
export function downloadAgreement(text: string, title: string, version: string): void {
  const safe = title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "NOTMADE-Agreement";
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}-${version}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function inr(n: number | null | undefined): string {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/** "₹1,200 + AED 55" for a per-currency amount bag. */
export function money(m: Money | null | undefined): string {
  const parts: string[] = [];
  if (m?.INR) parts.push(inr(m.INR));
  if (m?.AED) parts.push(aed(m.AED));
  return parts.length ? parts.join(" + ") : inr(0);
}

export function amountIn(currency: "INR" | "AED", n: number | null | undefined): string {
  return currency === "AED" ? aed(n) : inr(n);
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
