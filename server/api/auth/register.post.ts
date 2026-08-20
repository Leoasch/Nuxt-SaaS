import { User } from '~~/server/database/models/User'
import { z } from 'zod'
import { parseBody } from '~~/server/utils/accessValidation'

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
).superRefine(async (data, ctx) => {
  const existingUser = await User.findOne({ where: { email: data.email } })

  if (existingUser) {
    ctx.addIssue({
      code: 'custom',
      path: ['email'],
      message: 'email_already_in_use'
    })
  }
})

export default defineEventHandler(async (event) => {
  const result = await parseBody(event, registerSchema)

  const { name, email, password } = result.data

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