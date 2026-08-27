
<script setup lang="ts">
import StockForm from './Forms/StockForm.vue'

const overlay = useOverlay()

const { selectedOrganizationId } = useOrganization()

function openModal () {
  if (!selectedOrganizationId.value) {
    useToast().add({
      description: $t('stock.create.error.no_org'),
      color: 'error'
    })
    return
  }
  overlay.create(StockForm, { props: { orgId: selectedOrganizationId.value } }).open()
}
</script>
<template>
  <UButton
    variant="ghost"
    icon="i-lucide-plus"
    class="cursor-pointer"
    @click="openModal"
  >
    {{ $t('stock.create') }}
  </UButton>
</template>
