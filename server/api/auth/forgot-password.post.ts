import { createHash, randomBytes } from 'node:crypto'
import { z } from 'zod'
import { User } from '~~/server/database/models/User'
import { parseBody } from '~~/server/utils/accessValidation'
import { isDemoMode } from '~~/server/utils/demo'
import { sendMail } from '~~/server/utils/mailer'
import { isDemoEmail } from '~~/shared/utils/demo'
import { emailMessages } from '~~/shared/emails/messages'

const forgotPasswordSchema = z.object({ email: z.email() })
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const result = await parseBody(event, forgotPasswordSchema)
  const { email } = result.data

  const user = await User.findOne({ where: { email } })

  if (user && !(isDemoMode() && isDemoEmail(user.email))) {
    const token = randomBytes(32).toString('hex')
    user.resetPasswordTokenHash = createHash('sha256').update(token).digest('hex')
    user.resetPasswordTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)
    await user.save()

    try {
      const config = useRuntimeConfig()
      const resetUrl = `${config.appUrl}/auth/reset-password?token=${token}`
      const locale = getRequestLocale(event)
      const rendered = await renderEmail('ForgotPassword', { resetUrl, locale })
      await sendMail(user.email, { subject: rendered.subject ?? emailMessages(locale).forgotPassword.subject, html: rendered.html, text: rendered.text })
    } catch (error) {
      console.error('Failed to send password reset email', error)
    }
  }

  return { success: true }
})
