export const NEAR_MINIMUM_MARGIN = 0.2

export type StockStatus = 'below' | 'near' | 'ok'

export function nearMinimumLimit (minimum: number) {
  return minimum + Math.max(1, Math.ceil(minimum * NEAR_MINIMUM_MARGIN))
}

export function stockStatus ({ stock_quantity, minimum_stock }: { stock_quantity: number, minimum_stock: number }): StockStatus {
  if (minimum_stock <= 0) {
    return 'ok'
  }
  if (stock_quantity <= minimum_stock) {
    return 'below'
  }
  return stock_quantity <= nearMinimumLimit(minimum_stock) ? 'near' : 'ok'
}
