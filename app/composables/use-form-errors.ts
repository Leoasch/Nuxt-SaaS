import type { FieldErrorParams } from './use-api-error'

export default function useFormErrors<Field extends string, TopKey extends string> (
  fields: readonly Field[],
  topKey: TopKey,
  options: { overrides?: Record<string, string> } = {}
) {
  const { t } = useI18n()
  const { apiErrorMessage, fieldErrorMessage } = useApiError()

  // codes are stored and translated on read, so messages follow the active locale
  const apiError = shallowRef<any>(null)
  const localErrors = reactive<Record<string, string | undefined>>({})

  const errors = {} as Readonly<Partial<Record<Field | TopKey, string>>>

  for (const field of fields) {
    Object.defineProperty(errors, field, {
      enumerable: true,
      get: () => {
        const localKey = localErrors[field]
        if (localKey) {
          return t(localKey)
        }

        const data = apiError.value?.data?.data
        const code: string | undefined = data?.fields?.[field]
        return code ? fieldErrorMessage(field, code, data?.params?.[field] as FieldErrorParams | undefined) : undefined
      }
    })
  }

  Object.defineProperty(errors, topKey, {
    enumerable: true,
    get: () => apiError.value ? apiErrorMessage(apiError.value, options.overrides) : undefined
  })

  function resetErrors () {
    apiError.value = null
    for (const field of fields) {
      localErrors[field] = undefined
    }
  }

  function handleError (error: unknown) {
    resetErrors()
    apiError.value = error ?? {}
  }

  // client-side check, shown like a server field error; takes a translation key
  function setError (field: Field, key: string) {
    localErrors[field] = key
  }

  return { errors, resetErrors, handleError, setError }
}
