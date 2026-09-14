import { z } from 'zod'
import { accessMembership, organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const addMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'])
})

export default defineEventHandler(async (event) => {
  const { organization, membership: userMembership } = await organizationAccessValidation(event, ['MANAGER'])
  const { membership } = await accessMembership(event, organization.id)

  const { role } = (await parseBody(event, addMemberSchema)).data

  if (!hasMinimumRole(userMembership.role, membership.role)) {
    throw createError({
      statusCode: 405,
      statusMessage: 'User does not have permission to alter this member.',
      data: {
        code: 'MEMBERSHIP.NOT_ALLOWED',
      },
    })
  }

  if (!hasMinimumRole(userMembership.role, role)) {
    throw createError({
      statusCode: 405,
      statusMessage: 'User does not have permission to promote a member to this role.',
      data: {
        code: 'MEMBERSHIP.NOT_ALLOWED',
      },
    })
  }

  if (membership.user_id === userMembership.user_id) {
    throw createError({
      statusCode: 405,
      statusMessage: 'User does not have permission to alter their own role.',
      data: {
        code: 'MEMBERSHIP.ALTER_SELF_NOT_ALLOWED',
      },
    }) 
  }

  membership.role = role
  await membership.save()
  return { membership: membership }
})
