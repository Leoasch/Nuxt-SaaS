import { User } from '~~/server/database/models/User'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
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
  const body = await readBody(event)

  const result = registerSchema.safeParse(body)

  if (!result.success) {
    const fields: Record<string, string> = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !fields[field]) {
        fields[field] = issue.code === 'custom'
          ? issue.message
          : issue.code
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

  const { name, email, password } = result.data

  const existingUser = await User.findOne({
    where: { email },
  })

  if (existingUser) {
    throw createError({
      status: 409,
      data: {
        code: 'AUTH_EMAIL_ALREADY_EXISTS'
      }
    })
  }

  const passwordHash = await hashPassword(password)

  const user = await User.create({
    name,
    email,
    passwordHash
  })

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
})