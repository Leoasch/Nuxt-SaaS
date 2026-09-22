import { createHash } from 'node:crypto'
import { z } from 'zod'
import { User } from '~~/server/database/models/User'
import { parseBody } from '~~/server/utils/accessValidation'

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
  repeatPassword: z.string()
}).refine(
  data => data.password === data.repeatPassword,
  {
    path: ['repeatPassword'],
    message: 'password_do_not_match'
  }
)

export default defineEventHandler(async (event) => {
  const result = await parseBody(event, resetPasswordSchema)
  const { token, password } = result.data

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({ where: { resetPasswordTokenHash: tokenHash } })

  if (!user || !user.resetPasswordTokenExpiresAt || user.resetPasswordTokenExpiresAt.getTime() < Date.now()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired reset token.',
      data: {
        code: 'AUTH_INVALID_RESET_TOKEN',
      },
    })
  }

  user.passwordHash = await hashPassword(password)
  user.resetPasswordTokenHash = null
  user.resetPasswordTokenExpiresAt = null
  await user.save()

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  })

  return { success: true }
})
