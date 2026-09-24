import { CURRENCY } from '../app/common'

const numberFormats = {
  currency: { style: 'currency', currency: CURRENCY },
  integer: { maximumFractionDigits: 0 },
  decimal: { maximumFractionDigits: 2 }
} as const

export default defineI18nConfig(() => ({
  fallbackLocale: 'en',
  numberFormats: {
    'pt-BR': numberFormats,
    'en': numberFormats
  },
  datetimeFormats: {
    'pt-BR': {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      longDate: { year: 'numeric', month: 'long', day: 'numeric' },
      dateTime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' },
      dayMonth: { month: '2-digit', day: '2-digit' },
      time: { hour: '2-digit', minute: '2-digit' }
    },
    'en': {
      date: { year: 'numeric', month: 'short', day: 'numeric' },
      longDate: { year: 'numeric', month: 'long', day: 'numeric' },
      dateTime: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
      dayMonth: { month: 'short', day: 'numeric' },
      time: { hour: 'numeric', minute: '2-digit' }
    }
  }
}))
