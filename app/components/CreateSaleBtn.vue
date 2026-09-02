<script setup lang="ts">
import SaleForm from './Forms/SaleForm.vue'

const overlay = useOverlay()

const { selectedOrganizationId } = useOrganization()

function openModal () {
  if (!selectedOrganizationId.value) {
    useToast().add({
      description: $t('sale.create.error.no_org'),
      color: 'error'
    })
    return
  }
  overlay.create(SaleForm, { props: { orgId: selectedOrganizationId.value } }).open()
}
</script>
<template>
  <UButton
    variant="ghost"
    icon="i-lucide-plus"
    class="cursor-pointer"
    @click="openModal"
  >
    {{ $t('sale.create') }}
  </UButton>
</template>
