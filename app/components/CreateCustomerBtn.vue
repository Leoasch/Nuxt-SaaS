
<script setup lang="ts">
import CustomerForm from './Forms/CustomerForm.vue'

const overlay = useOverlay()

const { selectedOrganizationId } = useOrganization()

function openModal () {
  if (!selectedOrganizationId.value) {
    useToast().add({
      description: $t('customer.create.error.no_org'),
      color: 'error'
    })
    return
  }
  overlay.create(CustomerForm, { props: { orgId: selectedOrganizationId.value } }).open()
}
</script>
<template>
  <UButton
    variant="ghost"
    icon="i-lucide-plus"
    class="cursor-pointer"
    @click="openModal"
  >
    {{ $t('customer.create') }}
  </UButton>
</template>
