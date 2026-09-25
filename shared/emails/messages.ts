import type { AppLocale } from '../utils/locales'

export type EmailTextPart = string | { strong: string }

type InviteParams = { inviterName: string, organizationName: string }

type EmailMessages = {
  forgotPassword: {
    subject: string
    preview: string
    body: string
    button: string
    footer: string
  }
  verifyEmail: {
    subject: string
    preview: string
    body: string
    button: string
    footer: string
  }
  organizationInvite: {
    subject: (params: InviteParams) => string
    title: string
    preview: (params: InviteParams) => string
    body: (params: InviteParams) => EmailTextPart[]
    button: string
  }
}

const EMAIL_MESSAGES: Record<AppLocale, EmailMessages> = {
  'pt-BR': {
    forgotPassword: {
      subject: 'Redefina sua senha',
      preview: 'Redefina sua senha do Nuxt SaaS - este link expira em 1 hora.',
      body: 'Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para escolher uma nova. Este link expira em 1 hora.',
      button: 'Redefinir senha',
      footer: 'Se você não fez essa solicitação, pode ignorar este e-mail com segurança.'
    },
    verifyEmail: {
      subject: 'Confirme seu e-mail',
      preview: 'Confirme seu e-mail no Nuxt SaaS - este link expira em 24 horas.',
      body: 'Clique no botão abaixo para confirmar que este endereço de e-mail é seu. Este link expira em 24 horas.',
      button: 'Confirmar e-mail',
      footer: 'Se você não criou uma conta no Nuxt SaaS, pode ignorar este e-mail com segurança.'
    },
    organizationInvite: {
      subject: ({ organizationName }) => `Você foi convidado para participar de ${organizationName}`,
      title: 'Convite para organização',
      preview: ({ inviterName, organizationName }) => `${inviterName} convidou você para participar de ${organizationName}`,
      body: ({ inviterName, organizationName }) => [{ strong: inviterName }, ' convidou você para participar de ', { strong: organizationName }, '.'],
      button: 'Entrar para responder'
    }
  },
  'en': {
    forgotPassword: {
      subject: 'Reset your password',
      preview: 'Reset your Nuxt SaaS password - this link expires in 1 hour.',
      body: 'We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.',
      button: 'Reset your password',
      footer: 'If you did not request this, you can safely ignore this email.'
    },
    verifyEmail: {
      subject: 'Confirm your email',
      preview: 'Confirm your Nuxt SaaS email - this link expires in 24 hours.',
      body: 'Click the button below to confirm this email address belongs to you. This link expires in 24 hours.',
      button: 'Confirm email',
      footer: 'If you didn\'t create a Nuxt SaaS account, you can safely ignore this email.'
    },
    organizationInvite: {
      subject: ({ organizationName }) => `You've been invited to join ${organizationName}`,
      title: 'Organization invite',
      preview: ({ inviterName, organizationName }) => `${inviterName} invited you to join ${organizationName}`,
      body: ({ inviterName, organizationName }) => [{ strong: inviterName }, ' invited you to join ', { strong: organizationName }, '.'],
      button: 'Log in to respond'
    }
  }
}

export function emailMessages (locale: AppLocale): EmailMessages {
  return EMAIL_MESSAGES[locale]
}
