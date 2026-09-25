import { User } from '~~/server/database/models/User'
import { EMAIL_VERIFICATION_COOLDOWN_MS, EMAIL_VERIFICATION_TTL_MS, sendVerificationEmail } from '~~/server/utils/emailVerification'

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)

  const user = await User.findByPk(sessionUser.id)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
      data: {
        code: 'USER.NOT_FOUND',
      },
    })
  }

  if (user.emailVerifiedAt) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Email is already verified.',
      data: {
        code: 'EMAIL_VERIFICATION.ALREADY_VERIFIED',
      },
    })
  }

  const issuedAt = user.emailVerificationTokenExpiresAt
    ? user.emailVerificationTokenExpiresAt.getTime() - EMAIL_VERIFICATION_TTL_MS
    : 0

  if (Date.now() - issuedAt < EMAIL_VERIFICATION_COOLDOWN_MS) {
    throw createError({
      statusCode: 429,
      statusMessage: 'A verification email was sent recently.',
      data: {
        code: 'EMAIL_VERIFICATION.TOO_SOON',
      },
    })
  }

  await sendVerificationEmail(event, user)

  return { success: true }
})
