import { Op } from 'sequelize'
import { z } from 'zod'
import { User } from '~~/server/database/models/User'
import { parseBody } from '~~/server/utils/accessValidation'
import { sendVerificationEmail } from '~~/server/utils/emailVerification'

const editUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email()
})

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  if (id !== sessionUser.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only update your own profile.',
      data: {
        code: 'USER.NOT_ALLOWED',
      },
    })
  }

  const result = await parseBody(event, editUserSchema)

  const { name, email } = result.data

  const user = await User.findOne({ where: { id } })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
      data: {
        code: 'USER.NOT_FOUND',
      },
    })
  }

  const existingEmail = await User.findOne({ where: { email, id: { [Op.ne]: id } } })

  if (existingEmail) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Email is already in use.',
      data: {
        code: 'USER.EMAIL_TAKEN',
      },
    })
  }

  const emailChanged = user.email.toLowerCase() !== email.toLowerCase()

  if (emailChanged) {
    user.emailVerifiedAt = null
    user.emailVerificationTokenHash = null
    user.emailVerificationTokenExpiresAt = null
  }
  user.name = name
  user.email = email
  await user.save()

  await setUserSession(event, {
    user: { ...sessionUser, name, email }
  })

  if (emailChanged) {
    try {
      await sendVerificationEmail(event, user)
    } catch (error) {
      console.error('Failed to send email verification', error)
    }
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      emailVerified: !!user.emailVerifiedAt
    }
  }
})
