import { z } from 'zod'
import { User } from '~~/server/database/models/User'
import { parseBody } from '~~/server/utils/accessValidation'
import { hashVerificationToken } from '~~/server/utils/emailVerification'

const confirmEmailSchema = z.object({
  token: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const { token } = (await parseBody(event, confirmEmailSchema)).data

  const user = await User.findOne({ where: { emailVerificationTokenHash: hashVerificationToken(token) } })

  if (!user || !user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt.getTime() < Date.now()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired verification token.',
      data: {
        code: 'EMAIL_VERIFICATION.INVALID_TOKEN',
      },
    })
  }

  user.emailVerifiedAt = new Date()
  user.emailVerificationTokenHash = null
  user.emailVerificationTokenExpiresAt = null
  await user.save()

  return { success: true }
})
