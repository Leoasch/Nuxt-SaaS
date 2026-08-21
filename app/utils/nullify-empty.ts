export function nullifyEmpty<T extends Record<string, unknown>> (input: T): T {
  const result = { ...input } as Record<string, unknown>

  for (const key in result) {
    if (result[key] === '') {
      result[key] = null
    }
  }

  return result as T
}
