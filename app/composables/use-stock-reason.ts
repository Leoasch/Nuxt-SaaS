const SALE_REASON = /^Sale (\S+)( canceled)?$/

export default function useStockReason () {
  const { t } = useI18n()

  function formatReason (reason: string | null | undefined): string {
    if (!reason) {
      return ''
    }

    const match = SALE_REASON.exec(reason)

    if (!match) {
      return reason
    }

    return t(match[2] ? 'stock.reasons.sale_canceled' : 'stock.reasons.sale', { id: match[1] })
  }

  return { formatReason }
}
