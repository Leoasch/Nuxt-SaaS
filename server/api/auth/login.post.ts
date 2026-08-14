import { User } from '~~/server/database/models/User'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = loginSchema.safeParse(body)

  if (!result.success) {
    const fields: Record<string, string> = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string') {
        fields[field] = issue.code
      }
    }

    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: {
        code: 'VALIDATION_ERROR',
        fields,
      },
    })
  }

  const { email, password } = result.data

  const user = await User.findOne({
    where: { email }
  })

  if (!user) {
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
      email: user.email
    }
  })

  return {
    success: true,
  }
})
