// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    'nuxt-auth-utils',
    'nuxt-api-shield'
  ],

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

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

  routeRules: {
    '/': { prerender: true }
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
      { path: '/api' },
    ],
  },

  nitro: {
    storage: {
      shield: { driver: 'fs', base: './.data/shield' }
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