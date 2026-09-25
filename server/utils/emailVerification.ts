import { createHash, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import type { User } from '../database/models/User'
import { sendMail } from './mailer'
import { emailMessages } from '~~/shared/emails/messages'

export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000
export const EMAIL_VERIFICATION_COOLDOWN_MS = 60 * 1000

export function hashVerificationToken (token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function sendVerificationEmail (event: H3Event, user: User) {
  const token = randomBytes(32).toString('hex')
  user.emailVerificationTokenHash = hashVerificationToken(token)
  user.emailVerificationTokenExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS)
  await user.save()

  const config = useRuntimeConfig()
  const verifyUrl = `${config.appUrl}/auth/verify-email?token=${token}`
  const locale = getRequestLocale(event)
  const rendered = await renderEmail('VerifyEmail', { verifyUrl, locale })
  await sendMail(user.email, { subject: rendered.subject ?? emailMessages(locale).verifyEmail.subject, html: rendered.html, text: rendered.text })
}
