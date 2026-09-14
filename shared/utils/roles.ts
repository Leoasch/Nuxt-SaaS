import type { Role } from '~~/shared/types'

export const ROLE_RANK: Record<Role, number> = {
  OWNER: 0,
  ADMIN: 1,
  MANAGER: 2,
  EMPLOYEE: 3,
}

export function hasMinimumRole (role: Role, minRole: Role): boolean {
  return ROLE_RANK[role] <= ROLE_RANK[minRole]
}
