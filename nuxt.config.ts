// https://nuxt.com/docs/api/configuration/nuxt-config
import { DEFAULT_LOCALE, LOCALE_COOKIE } from './shared/utils/locales'

const LOCALE_FILES = ['common.json', 'errors.json', 'auth.json', 'settings.json', 'organizations.json', 'products.json', 'customers.json', 'sales.json']

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    'nuxt-auth-utils',
    'nuxt-api-shield',
    '@lupinum/nuxt-email'
  ],

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: DEFAULT_LOCALE,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: LOCALE_COOKIE,
      fallbackLocale: DEFAULT_LOCALE
    },
    locales: [
      {
        code: 'pt-BR',
        language: 'pt-BR',
        name: 'Português',
        files: LOCALE_FILES.map(file => `pt-BR/${file}`)
      },
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
        files: LOCALE_FILES.map(file => `en/${file}`)
      }
    ]
  },

  runtimeConfig: {
    databaseHost: '',
    databasePort: 5432,
    databaseName: '',
    databaseUser: '',
    databasePassword: '',
    s3Endpoint: '',
    s3Region: 'us-east-1',
    s3Bucket: '',
    s3AccessKeyId: '',
    s3SecretAccessKey: '',
    mailHost: '',
    mailPort: 1025,
    mailSecure: false,
    mailUser: '',
    mailPassword: '',
    mailFrom: 'no-reply@nuxt-saas.local',
    appUrl: 'http://localhost:3000',
    session: {
      maxAge: 60 * 60 * 24 * 30
    },
    public: {
      nuxtApiShield: {
        security: {
          // true only when a reverse proxy sits in front and can be trusted to set/overwrite
          // this header itself - otherwise it's spoofable by any client. Set via
          // TRUST_X_FORWARDED_FOR=true in .env.
          trustXForwardedFor: process.env.TRUST_X_FORWARDED_FOR === 'true'
        }
      }
    }
  },

  nuxtApiShield: {
    limit: {
      max: 120,
      duration: 60,
      ban: 900,
    },
    delayOnBan: true,
    errorMessage: 'Too Many Requests',
    retryAfterHeader: false,
    routes: [
      { path: '/api/auth/login', max: 8, duration: 60, ban: 900 },
      { path: '/api/auth/register', max: 5, duration: 60, ban: 900 },
      { path: '/api/auth/change-password', max: 5, duration: 60, ban: 900 },
      { path: '/api/auth/delete-account', max: 5, duration: 60, ban: 900 },
      { path: '/api/auth/forgot-password', max: 5, duration: 60, ban: 900 },
      { path: '/api/auth/reset-password', max: 5, duration: 60, ban: 900 },
      { path: '/api/auth/verify-email/send', max: 5, duration: 60, ban: 900 },
      { path: '/api/auth/verify-email/confirm', max: 10, duration: 60, ban: 900 },
      { path: '/api/organizations/*/invite', pattern: true, max: 10, duration: 60, ban: 300 },
      { path: '/api' },
    ],
  },

  nitro: {
    storage: {
      shield: { driver: 'fs', base: './.data/shield' }
    },
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      // every 5 min: drop bans whose duration has already expired
      '*/5 * * * *': 'shield:cleanBans',
      // once a day at 03:00: drop IP tracking entries older than ipTTL
      '0 3 * * *': 'shield:cleanIpData'
    }
  },

  compatibilityDate: '2026-06-30'
})