import { Organization } from '../database/models/Organization'
import { OrganizationMember } from '../database/models/OrganizationMember'

export async function findOwnedOrganizations (userId: string) {
  const memberships = await OrganizationMember.findAll({
    where: { user_id: userId, role: 'OWNER' }
  })

  if (memberships.length === 0) {
    return []
  }

  return await Organization.findAll({
    where: { id: memberships.map(membership => membership.organization_id) },
    order: [['name', 'ASC']]
  })
}
