import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const memberships = await OrganizationMember.findAll({
    where: { user_id: user.id },
    order: [['accepted_at', 'DESC']]
  })

  if (memberships.length === 0) {
    return {
      organizations: []
    }
  }

  const roleByOrganizationId = new Map(
    memberships.map(membership => [membership.organization_id, {
      role: membership.role,
      is_member: !membership.pending_invite
    }])
  )

  const paging = getPagingParams(event)

  const { count, rows: organizations } = await Organization.findAndCountAll({
    where: { id: [...roleByOrganizationId.keys()] },
    order: [['createdAt', 'ASC']],
    limit: paging.limit,
    offset: paging.index,
  })

  return {
    page: makePage(count, paging),
    organizations: organizations
      .map(organization => ({
        id: organization.id,
        name: organization.name,
        document: organization.document,
        role: roleByOrganizationId.get(organization.id)!.role,
        is_member: roleByOrganizationId.get(organization.id)!.is_member,
      }))
      .sort((a, b) => {
        if (a.is_member !== b.is_member) {
          return a.is_member ? -1 : 1
        }
        return ROLE_RANK[a.role] - ROLE_RANK[b.role]
      })
  }
})
