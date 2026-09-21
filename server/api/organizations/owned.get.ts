import { findOwnedOrganizations } from '~~/server/utils/ownedOrganizations'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const organizations = await findOwnedOrganizations(user.id)

  return {
    organizations: organizations.map(organization => ({
      id: organization.id,
      name: organization.name,
      document: organization.document,
      role: 'OWNER' as const,
      is_member: true
    }))
  }
})
