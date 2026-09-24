export type FieldErrorParams = { minimum?: number, maximum?: number, origin?: string, format?: string }

export default function useApiError () {
  const { t, te } = useI18n()
  const toast = useToast()

  function apiErrorMessage (error: any, overrides: Record<string, string> = {}): string {
    const status = error?.statusCode ?? error?.status

    if (status === 429) {
      const seconds = error?.data?.retryAfter
      return seconds ? t('errors.RATE_LIMITED_RETRY', { seconds }) : t('errors.RATE_LIMITED')
    }

    const code = error?.data?.data?.code

    if (code && overrides[code]) {
      return t(overrides[code])
    }

    if (code && te(`errors.${code}`)) {
      return t(`errors.${code}`)
    }

    if (status === 401) {
      return t('errors.UNAUTHORIZED')
    }

    return t('errors.UNKNOWN')
  }

  function fieldErrorMessage (field: string, code: string, params: FieldErrorParams = {}): string {
    const specific = `validation.${field}.${code}`

    if (te(specific)) {
      return t(specific, params)
    }

    const variant = params.origin ?? params.format
    const limit = params.minimum ?? params.maximum

    for (const key of [variant && `validation.${code}.${variant}`, `validation.${code}.default`, `validation.${code}`]) {
      if (key && te(key)) {
        return limit === undefined ? t(key, params) : t(key, params, limit)
      }
    }

    return t('validation.invalid')
  }

  function toastApiError (error: unknown, title?: string) {
    toast.add({
      title,
      description: apiErrorMessage(error),
      color: 'error'
    })
  }

  return { apiErrorMessage, fieldErrorMessage, toastApiError }
}
