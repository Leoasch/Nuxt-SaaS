import { sequelize } from '~~/server/database'
import { accessMembership, organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization, membership: ownerMembership } = await organizationAccessValidation(event, ['OWNER'])
  const { membership: targetMembership } = await accessMembership(event, organization.id)

  if (targetMembership.user_id === ownerMembership.user_id) {
    throw createError({
      statusCode: 405,
      statusMessage: 'You are already the owner of this organization.',
      data: {
        code: 'MEMBERSHIP.ALREADY_OWNER',
      },
    })
  }

  if (targetMembership.pending_invite) {
    throw createError({
      statusCode: 405,
      statusMessage: 'Cannot transfer ownership to a member who has not accepted their invite.',
      data: {
        code: 'MEMBERSHIP.PENDING',
      },
    })
  }

  await sequelize.transaction(async (transaction) => {
    ownerMembership.role = 'ADMIN'
    await ownerMembership.save({ transaction })

    targetMembership.role = 'OWNER'
    await targetMembership.save({ transaction })
  })

  return { membership: targetMembership, previousOwnerMembership: ownerMembership }
})
