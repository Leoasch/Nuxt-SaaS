import type { User } from '~~/shared/types'
import { apiRequest } from '.'

export type RegisterBody = {
  name: string
  email: string
  password: string
  repeatPassword: string
}

export type LoginBody = {
  email: string
  password: string
}

export type ChangePasswordBody = {
  oldPassword: string
  newPassword: string
  repeatNewPassword: string
}

export async function register (body: RegisterBody) {
  return await apiRequest<{ user: User }>('/auth/register', {
    method: 'POST',
    body,
  })
}

export async function login (body: LoginBody) {
  return await apiRequest<{ success: true }>('/auth/login', {
    method: 'POST',
    body,
  })
}

export async function logout () {
  return await apiRequest<{ success: true }>('/auth/logout', {
    method: 'POST',
  })
}

export async function updatePassword (body: ChangePasswordBody) {
  return await apiRequest<{ success: true }>('/auth/change-password', {
    method: 'PUT',
    body
  })
}

export async function deleteAccount (password: string) {
  return await apiRequest<{ success: true }>('/auth/delete-account', {
    method: 'DELETE',
    body: { password }
  })
}

export async function forgotPassword (email: string) {
  return await apiRequest<{ success: true }>('/auth/forgot-password', {
    method: 'POST',
    body: { email }
  })
}

export async function resetPassword (token: string, password: string, repeatPassword: string) {
  return await apiRequest<{ success: true }>('/auth/reset-password', {
    method: 'POST',
    body: { token, password, repeatPassword }
  })
}
