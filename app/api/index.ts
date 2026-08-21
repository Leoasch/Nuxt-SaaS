const baseURL = '/api'

export async function apiRequest<T> (url: string, options: any = {}): Promise<T | null> {
  try {
    return await ($fetch<T>(url, { baseURL, ...options }) as Promise<T>)
  } catch (e: any) {
    console.error(`API error at ${url}:`, e?.message)
    return null
  }
}

export const orgRoute = (id: string) => `/organizations/${id}`