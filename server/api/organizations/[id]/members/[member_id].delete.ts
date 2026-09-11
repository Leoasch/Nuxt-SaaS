import { Op } from 'sequelize'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { accessMembership } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization, membership: userMembership } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])

  const { membership } = await accessMembership(event, organization.id)

  if (membership.role === 'ADMIN' && userMembership.role !== 'ADMIN') {
    throw createError({
      statusCode: 405,
      statusMessage: 'User does not have permission to remove an ADMIN member.',
      data: {
        code: 'MEMBERSHIP.NOT_ALLOWED',
      },
    })
  }

  if (membership.role === 'ADMIN') {
    const adminCount = await OrganizationMember.count({
      where: { role: 'ADMIN', organization_id: organization.id, accepted_at: { [Op.ne]: null } }
    })

    if (adminCount === 1) {
      throw createError({
        statusCode: 405,
        statusMessage: 'User does not have permission to remove the last ADMIN member.',
        data: {
          code: 'MEMBERSHIP.REMOVE_LAST_ADMIN_NOT_ALLOWED',
        },
      })
    }
  }

  await membership.destroy()

  return { membership }
})
