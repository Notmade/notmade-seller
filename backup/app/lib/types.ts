export interface SellerProfile {
  id: string
  name: string
  brandName: string
  email: string
  phone: string
  instagram?: string
  category: string
  status: 'pending' | 'active' | 'suspended'
  gstin?: string
  upiId?: string
  bankHolder?: string
  bankNumber?: string
  ifsc?: string
  bankName?: string
  warehouseAddress?: string
  warehouseCity?: string
  warehouseState?: string
  warehousePincode?: string
  warehouseContact?: string
  warehousePhone?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  warehouseId?: string
  createdAt: string
}

export interface Order {
  id: string
  orderId: string
  productName: string
  productId: string
  quantity: number
  salePrice: number
  commission: number
  payout: number
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'
  customerCity: string
  date: string
  readyForPickup: boolean
}

export interface Payout {
  id: string
  amount: number
  orderCount: number
  status: 'pending' | 'processing' | 'paid'
  createdAt: string
  paidAt?: string
  invoiceUrl?: string
}

export interface DashboardStats {
  totalSalesThisMonth: number
  pendingPayouts: number
  activeProducts: number
  totalOrders: number
}

export interface ContractInfo {
  status: 'pending_signature' | 'signed' | 'active'
  contractUrl?: string
  signedUrl?: string
  generatedAt?: string
  signedAt?: string
}
