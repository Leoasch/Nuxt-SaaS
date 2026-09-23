import { User } from '~~/server/database/models/User'
import { z } from 'zod'
import { parseBody } from '~~/server/utils/accessValidation'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const result = await parseBody(event, loginSchema)

  const { email, password } = result.data

  const user = await User.findOne({
    where: { email }
  })

  if (!user || !user.passwordHash) {
    throw createError({
      statusCode: 401,
      data: {
        code: 'AUTH_INVALID_CREDENTIALS'
      }
    })
  }

  const passwordValid = await verifyPassword(
    user.passwordHash,
    password
  )

  if (!passwordValid) {
    throw createError({
      statusCode: 401,
      data: {
        code: 'AUTH_INVALID_CREDENTIALS'
      }
    })
  }

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
