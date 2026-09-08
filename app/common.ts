import type { SaleLine } from '~~/shared/types'

export function emptyLine (): SaleLine {
  return { product_id: null, product: null, quantity: 1, unit_price: 0 }
}

export const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: 'lucide:banknote',
  credit_card: 'lucide:credit-card',
  debit_card: 'lucide:credit-card',
  pix: 'lucide:qr-code',
  other: 'lucide:circle-dollar-sign'
}