<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ]
})

const title = 'Nuxt SaaS'
const description = 'Uma aplicação SaaS para teste'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
