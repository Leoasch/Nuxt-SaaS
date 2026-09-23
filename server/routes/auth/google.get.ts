import { sequelize } from '~~/server/database'
import { User } from '~~/server/database/models/User'

const googleHandler = defineOAuthGoogleEventHandler({
  config: { redirectURL: `${useRuntimeConfig().appUrl}/auth/google` },
  async onSuccess (event, { user: googleUser }) {
    if (!googleUser.email || googleUser.email_verified !== true) {
      return sendRedirect(event, '/auth/login?error=GOOGLE_EMAIL_UNVERIFIED')
    }

    const email = String(googleUser.email).toLowerCase()

    let user = await User.findOne({ where: { googleId: googleUser.sub } })

    if (!user) {
      user = await User.findOne({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), email)
      })

      if (user) {
        user.googleId = googleUser.sub
        await user.save()
      } else {
        user = await User.create({
          name: googleUser.name || email.split('@')[0],
          email,
          googleId: googleUser.sub,
          passwordHash: null
        })
      }
    }

    await replaceUserSession(event, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        hasPassword: !!user.passwordHash
      }
    })

    return sendRedirect(event, '/')
  },
  onError (event, error) {
    console.error('Google OAuth error', error)
    return sendRedirect(event, '/auth/login?error=GOOGLE_AUTH_FAILED')
  }
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (query.error) {
    return sendRedirect(event, '/auth/login?error=GOOGLE_AUTH_CANCELLED')
  }

  if (query.code && !query.state) {
    return sendRedirect(event, '/auth/login?error=GOOGLE_AUTH_FAILED')
  }

  try {
    return await googleHandler(event)
  } catch (error) {
    console.error('Google OAuth error', error)
    return sendRedirect(event, '/auth/login?error=GOOGLE_AUTH_FAILED')
  }
})
