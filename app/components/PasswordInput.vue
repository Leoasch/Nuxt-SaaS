<script setup lang="ts">
const password = defineModel<string>({ default: '' })
const show = ref(false)
</script>

<template>
  <UInput
    v-model="password"
    class="w-full"
    :placeholder="$t('password')"
    :type="show ? 'text' : 'password'"
    :ui="{ trailing: 'pe-1' }">
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="show ? 'Hide password' : 'Show password'"
        :aria-pressed="show"
        aria-controls="password"
        @click="show = !show"
      />
    </template>

  </UInput>
</template>