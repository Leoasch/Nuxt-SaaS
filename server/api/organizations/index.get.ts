import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const memberships = await OrganizationMember.findAll({
    where: { user_id: user.id }
  })

  if (memberships.length === 0) {
    return {
      organizations: []
    }
  }

  const roleByOrganizationId = new Map(
    memberships.map(membership => [membership.organization_id, membership.role])
  )

  const organizations = await Organization.findAll({
    where: { id: [...roleByOrganizationId.keys()] },
    order: [['createdAt', 'ASC']],
  })

  return {
    organizations: organizations.map(organization => ({
      id: organization.id,
      name: organization.name,
      document: organization.document,
      role: roleByOrganizationId.get(organization.id)
    }))
  }
})
