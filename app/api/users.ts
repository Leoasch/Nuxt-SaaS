import type { User } from '~~/shared/types'
import { apiRequest } from '.'

export type EditUserBody = {
  name: string
  email: string
}

export async function searchUsers (query: string) {
  return await apiRequest<{ users: User[] }>('/users/search', {
    query: { q: query }
  })
}

export async function getUser (id: string) {
  return await apiRequest<{ user: User }>(`/users/${id}`)
}

export async function editUser (id: string, body: EditUserBody) {
  return await apiRequest<{ user: User }>(`/users/${id}`, {
    method: 'PUT',
    body,
  })
}

export async function uploadAvatar (id: string, file: File) {
  const body = new FormData()
  body.append('avatar', file)

  return await apiRequest<{ avatarUrl: string }>(`/users/${id}/avatar`, {
    method: 'POST',
    body,
  })
}

export async function deleteAvatar (id: string) {
  return await apiRequest<{ avatarUrl: null }>(`/users/${id}/avatar`, {
    method: 'DELETE'
  })
}
