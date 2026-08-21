export default function useFormErrors<Field extends string, TopKey extends string> (
  fields: readonly Field[],
  topKey: TopKey
) {
  const { t } = useI18n()

  type Errors = Partial<Record<Field | TopKey, string | undefined>>

  const errors = reactive<Errors>({})
  const bag = errors as Record<string, string | undefined>

  function resetErrors () {
    for (const field of fields) {
      bag[field] = undefined
    }
    bag[topKey] = undefined
  }

  function handleError (error: any) {
    const fieldErrors = error?.data?.data?.fields
    const code = error?.data?.data?.code

    for (const field of fields) {
      bag[field] = fieldErrors?.[field]
        ? t(`validation.${field}.${fieldErrors[field]}`)
        : undefined
    }

    bag[topKey] = code ? t(`errors.${code}`) : t('errors.UNKNOWN')
  }

  return { errors, resetErrors, handleError }
}
