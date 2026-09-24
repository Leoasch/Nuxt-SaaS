import { accessMembership } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization, membership: userMembership } = await organizationAccessValidation(event, ['MANAGER'], { allowSelf: true })

  const { membership } = await accessMembership(event, organization.id)

  if (membership.role === 'OWNER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'The organization owner cannot be removed.',
      data: {
        code: 'MEMBERSHIP.OWNER_CANNOT_BE_REMOVED',
      },
    })
  }

  if (!hasMinimumRole(userMembership.role, membership.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User does not have permission to remove this member.',
      data: {
        code: 'MEMBERSHIP.NOT_ALLOWED',
      },
    })
  }

  await membership.destroy()

  return { membership }
})
