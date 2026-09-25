<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t, localeProperties } = useI18n()
const uiLocale = useUiLocale()

const statusCode = computed(() => props.error.status || 500)
const isNotFound = computed(() => statusCode.value === 404)

const copy = computed(() => isNotFound.value
  ? { title: t('error_page.not_found.title'), description: t('error_page.not_found.description') }
  : { title: t('error_page.generic.title'), description: t('error_page.generic.description') })

const devMessage = import.meta.dev ? props.error.message : null

useHead({
  htmlAttrs: {
    lang: () => localeProperties.value.language
  },
  title: () => `${statusCode.value} - ${copy.value.title}`
})

function goHome () {
  clearError({ redirect: '/' })
}

function retry () {
  reloadNuxtApp()
}
</script>

<template>
  <UApp :locale="uiLocale">
    <UMain class="h-dvh w-dvw">
      <NuxtLayout name="no-auth">
        <div class="m-auto flex w-120 max-w-full flex-col items-center gap-3 pb-40 text-center">
          <p class="text-7xl font-bold text-primary">{{ statusCode }}</p>
          <h1 class="text-2xl font-bold">{{ copy.title }}</h1>
          <p class="text-dimmed">{{ copy.description }}</p>
          <pre
            v-if="devMessage"
            class="mt-2 max-h-40 w-full overflow-auto rounded border border-accented bg-accented/20 p-3 text-left text-xs whitespace-pre-wrap">{{ devMessage }}</pre>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <UButton
              v-if="!isNotFound"
              icon="lucide:rotate-cw"
              color="neutral"
              variant="outline"
              class="cursor-pointer"
              @click="retry">
              {{ $t('error_page.retry') }}
            </UButton>
            <UButton
              icon="lucide:house"
              class="cursor-pointer"
              @click="goHome">
              {{ $t('error_page.home') }}
            </UButton>
          </div>
        </div>
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
