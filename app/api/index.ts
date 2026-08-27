import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

const baseURL = '/api'

export async function apiRequest<T> (url: string, options: NitroFetchOptions<NitroFetchRequest> = {}): Promise<T> {
  return await ($fetch<T>(url, { baseURL, ...options }) as Promise<T>)
}

export const orgRoute = (id: string) => `/organizations/${id}`