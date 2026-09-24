import { z } from 'zod'
import { organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const acceptInviteSchema = z.object({
  accept: z.boolean()
})

export default defineEventHandler(async (event) => {
  const { membership } = await organizationAccessValidation(event, [], { allowPending: true })

  if (!membership.pending_invite) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User does not have permission to accept an already accepted invite.',
      data: {
        code: 'MEMBERSHIP.ALREADY_ACCEPTED',
      },
    })
  }
  
  const { accept } = (await parseBody(event, acceptInviteSchema)).data

  if (accept) {
    membership.accepted_at = new Date()
    await membership.save()
  } else {
    await membership.destroy()
  }

  return { membership: membership }
})
