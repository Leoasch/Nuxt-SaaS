import type { Role, SaleLine } from '~~/shared/types'

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

export const ROLE_STYLES: Record<Role, { label: string; color: 'error' | 'warning' | 'neutral'; icon: string; accent: string }> = {
  ADMIN: { label: 'Admin', color: 'error', icon: 'i-lucide-shield-check', accent: 'border-l-error' },
  MANAGER: { label: 'Manager', color: 'warning', icon: 'i-lucide-briefcase', accent: 'border-l-warning' },
  EMPLOYEE: { label: 'Employee', color: 'neutral', icon: 'i-lucide-user', accent: 'border-l-neutral' },
}