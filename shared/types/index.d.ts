
export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

export interface DatabaseModel {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface Organization extends DatabaseModel {
  name: string,
  document: string | null
  role: Role
}

export interface ProductImage extends DatabaseModel {
  product_id: string
  key: string
  mime_type: string
  size: number
}

export interface Product extends DatabaseModel {
  organization_id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  minimum_stock: number;
  images?: ProductImage[]
}

export interface Customer extends DatabaseModel {
  organization_id: string
  name: string
  email: string | null
  phone: string | null
  document: string | null
}

export interface StockMovement extends DatabaseModel {
  organization_id: string
  user_id: string
  product_id: string
  product_name?: string
  quantity: number
  reason: string | null
}

export interface SaleItem extends DatabaseModel {
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  original_unit_price: number
  total: number
}

export interface Sale extends DatabaseModel {
  organization_id: string
  user_id: string
  customer_id: string | null
  total: number
  payment_method: string
  sale_items: SaleItem[]
}

export type SaleLine = {
  product_id: string | null
  product: Product | null
  quantity: number
  unit_price: number
}

export type DisplayType = 'list' | 'grid'