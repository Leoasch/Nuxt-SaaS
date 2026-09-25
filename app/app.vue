<script setup>
const { t, localeProperties } = useI18n()
const uiLocale = useUiLocale()

useHead({
  htmlAttrs: {
    lang: () => localeProperties.value.language
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ]
})

useSeoMeta({
  title: () => t('app.title'),
  description: () => t('app.description'),
  ogTitle: () => t('app.title'),
  ogDescription: () => t('app.description')
})
</script>

<template>
  <UApp :locale="uiLocale">
    <UMain class="h-dvh w-dvw">
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
