import type { Role, SaleLine } from '~~/shared/types'

export function emptyLine (): SaleLine {
  return { product_id: null, product: null, quantity: 1, unit_price: 0 }
}

export const CURRENCY = 'BRL'

export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: 'lucide:banknote',
  credit_card: 'lucide:credit-card',
  debit_card: 'lucide:credit-card',
  pix: 'lucide:qr-code',
  other: 'lucide:circle-dollar-sign'
}

export const ROLE_STYLES: Record<Role, { color: 'primary' | 'error' | 'warning' | 'neutral'; icon: string; accent: string }> = {
  OWNER: { color: 'primary', icon: 'i-lucide-crown', accent: 'border-l-primary' },
  ADMIN: { color: 'error', icon: 'i-lucide-shield-check', accent: 'border-l-error' },
  MANAGER: { color: 'warning', icon: 'i-lucide-briefcase', accent: 'border-l-warning' },
  EMPLOYEE: { color: 'neutral', icon: 'i-lucide-user', accent: 'border-l-neutral' },
}