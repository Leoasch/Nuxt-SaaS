import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

const baseURL = '/api'

export async function apiRequest<T> (url: string, options: NitroFetchOptions<NitroFetchRequest> = {}): Promise<T> {
  const fetch = useRequestFetch()
  const session = import.meta.client ? useUserSession() : null

  try {
    return await (fetch(url, { baseURL, ...options }) as Promise<T>)
  } catch (error: any) {
    if (session?.loggedIn.value && error?.statusCode === 401) {
      await session.fetch()
      if (!session.loggedIn.value) {
        await navigateTo('/auth/login')
      }
    }
    throw error
  }
}

export const orgRoute = (id: string) => `/organizations/${id}`
