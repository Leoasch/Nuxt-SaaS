
<script setup lang="ts">
import ProductForm from './Forms/ProductForm.vue'

const overlay = useOverlay()

const { selectedOrganizationId } = useOrganization()

function openModal () {
  if (!selectedOrganizationId.value) {
    useToast().add({
      description: $t('common.select_organization_first'),
      color: 'error'
    })
    return
  }
  overlay.create(ProductForm, { props: { product: undefined, orgId: selectedOrganizationId.value } }).open()
}
</script>
<template>
  <UButton
    variant="ghost"
    icon="i-lucide-plus"
    class="cursor-pointer"
    @click="openModal"
  >
    {{ $t('product.create') }}
  </UButton>
</template>
