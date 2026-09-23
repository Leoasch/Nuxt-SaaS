import { User } from '~~/server/database/models/User'
import { z } from 'zod'
import { parseBody } from '~~/server/utils/accessValidation'

const changePasswordSchema = z.object({
  oldPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128),
  repeatNewPassword: z.string()
}).refine(
  data => data.newPassword === data.repeatNewPassword,
  {
    path: ['repeatNewPassword'],
    message: 'password_do_not_match'
  }
)

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)

  const result = await parseBody(event, changePasswordSchema)

  const { newPassword, oldPassword } = result.data

  const user = await User.findOne({
    where: { id: sessionUser.id }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      data: {
        code: 'AUTH_INVALID_CREDENTIALS'
      }
    })
  }

  if (user.passwordHash) {
    const passwordValid = !!oldPassword && await verifyPassword(user.passwordHash, oldPassword)

    if (!passwordValid) {
      throw createError({
        statusCode: 401,
        data: {
          code: 'AUTH_INVALID_CREDENTIALS'
        }
      })
    }
  }

  const passwordHash = await hashPassword(newPassword)
  user.passwordHash = passwordHash
  await user.save()

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      hasPassword: true
    }
  })

  return {
    success: true,
  }
})
