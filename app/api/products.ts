import type { Product, ProductImage } from '~~/shared/types'
import { apiRequest, orgRoute } from '.'

type ProductBody = {
  name: string;
  sku: string | null;
  barcode: string | null;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  minimum_stock: number;
}

export async function getProducts(org_id: string): Promise<{ products: Product[] } | null>
export async function getProducts(org_id: string, id: string): Promise<{ product: Product } | null>
export async function getProducts (org_id: string, id?: string) {

  if (!id) {
    return await apiRequest<{ products: Product[] }>(orgRoute(org_id) + '/products')
  }
  return await apiRequest<{ product: Product }>(orgRoute(org_id) + `/products/${id}`)
}

export async function postProduct (org_id: string, body: ProductBody) {
  return await apiRequest<{ product: Product }>(orgRoute(org_id) + '/products', {
    body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function editProduct (org_id: string, id: string, body: Partial<ProductBody>) {
  return await apiRequest<{ product: Product }>(orgRoute(org_id) + `/products/${id}`, {
    body,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function deleteProduct (org_id: string, id: string) {
  return await apiRequest<{ product: Product }>(orgRoute(org_id) + `/products/${id}`, { method: 'DELETE' })
}

export async function getProductImages (org_id: string, product_id: string) {
  return await apiRequest<{ images: ProductImage[] }>(orgRoute(org_id) + `/products/${product_id}/images`)
}

export async function uploadProductImages (org_id: string, product_id: string, files: File[]) {
  const body = new FormData()

  for (const file of files) {
    body.append('images', file)
  }

  return await apiRequest<{ images: ProductImage[] }>(orgRoute(org_id) + `/products/${product_id}/images`, {
    body,
    method: 'POST',
  })
}

export async function deleteProductImage (org_id: string, product_id: string, image_id: string) {
  return await apiRequest<{ image: { id: string; product_id: string } }>(
    orgRoute(org_id) + `/products/${product_id}/images/${image_id}`,
    { method: 'DELETE' }
  )
}

export function productImageUrl (org_id: string, product_id: string, image_id: string) {
  return `/api${orgRoute(org_id)}/products/${product_id}/images/${image_id}`
}
