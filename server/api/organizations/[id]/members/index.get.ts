import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { User } from '~~/server/database/models/User'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const memberships = await OrganizationMember.findAll({
    where: { organization_id: organization.id },
    include: { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }
  })

  return { memberships }
})
