import type { User } from '#auth-utils'
import { apiRequest } from '.'

export async function searchUsers (query: string) {
  return await apiRequest<{ users: User[] }>('/users/search', {
    query: { q: query }
  })
}

export async function getUser (id: string) {
  return await apiRequest<{ user: User }>(`/users/${id}`)
}
