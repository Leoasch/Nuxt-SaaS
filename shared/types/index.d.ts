
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

export type DisplayType = 'list' | 'grid'