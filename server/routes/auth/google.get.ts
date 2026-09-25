import { sequelize } from '~~/server/database'
import { User } from '~~/server/database/models/User'

const googleHandler = defineOAuthGoogleEventHandler({
  config: { redirectURL: `${useRuntimeConfig().appUrl}/auth/google` },
  async onSuccess (event, { user: googleUser }) {
    if (!googleUser.email || googleUser.email_verified !== true) {
      return sendRedirect(event, '/auth/login?error=GOOGLE_EMAIL_UNVERIFIED')
    }

    const email = String(googleUser.email).toLowerCase()
    const locale = getRequestLocale(event)

    let user = await User.findOne({ where: { googleId: googleUser.sub } })

    if (!user) {
      user = await User.findOne({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), email)
      })

      if (user) {
        if (!user.emailVerifiedAt) {
          user.passwordHash = null
          user.sessionVersion += 1
        }
        user.googleId = googleUser.sub
      } else {
        user = await User.create({
          name: googleUser.name || email.split('@')[0],
          email,
          googleId: googleUser.sub,
          emailVerifiedAt: new Date(),
          passwordHash: null,
          locale
        })
      }
    }

    if (user.email.toLowerCase() === email) {
      user.emailVerifiedAt ??= new Date()
    }
    user.locale = locale
    await user.save()

    await startUserSession(event, user)

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
