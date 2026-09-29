export const SEED_EMAIL_DOMAIN = 'seed.example.com'

export const isDemoEmail = (email: string | null | undefined) => !!email && email.toLowerCase().endsWith(`@${SEED_EMAIL_DOMAIN}`)
