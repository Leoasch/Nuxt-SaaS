
<script setup lang="ts">
import OrganizationForm from './Forms/OrganizationForm.vue'

const overlay = useOverlay()

function openModal () {
  overlay.create(OrganizationForm, { props: { organization: undefined } }).open()
}
</script>
<template>
  <UButton
    variant="ghost"
    icon="i-lucide-plus"
    class="cursor-pointer"
    @click="openModal"
  >
    {{ $t('organization.create') }}
  </UButton>
</template>
