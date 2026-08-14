// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseHost: '',
    databasePort: 5432,
    databaseName: '',
    databaseUser: '',
    databasePassword: ''
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30'
})