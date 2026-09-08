<script setup lang="ts">
import { deleteCustomer, getCustomers } from '~/api/customers'
import type { Customer } from '~~/shared/types'
import CustomerForm from '../Forms/CustomerForm.vue'
import ConfirmDeleteDialog from '../ConfirmDeleteDialog.vue'

const props = defineProps<{
  customerId: string
}>()

const customer = ref<Customer | null>(null)
const loading = ref(false)
const { selectedOrganizationId } = useOrganization()
const { loadCustomers } = useCustomers()
const overlay = useOverlay()
const emits = defineEmits(['close'])

async function onLoad () {
  try {
    loading.value = true
    if (selectedOrganizationId.value) {
      const result = await getCustomers(selectedOrganizationId.value, props.customerId)
      if (result.customer) {
        customer.value = result.customer
      }
    }
  } finally {
    loading.value = false
  }
}

async function onEdit () {
  if (customer.value) {
    const dialog = overlay.create(
      CustomerForm,
      { props: { 
        orgId: customer.value?.organization_id,
        customer: customer.value
      } }
    ).open()
    if (await dialog.result) {
      await onLoad()
    }
  }
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
const formattedCreatedAt = computed(() => customer.value?.createdAt ? dateFormatter.format(new Date(customer.value.createdAt)) : '')

async function onDelete () {
  const dialog = overlay.create(ConfirmDeleteDialog, {
    props: {
      title: $t('customer.confirm_delete.title'),
      description: $t('customer.confirm_delete.description'),
    }
  }).open()
  if (await dialog.result) {
    if (customer.value) {
      const result = await deleteCustomer(customer.value?.organization_id, customer.value.id)
      if (result.customer) {
        useToast().add({
          description: $t('customer.delete_success'),
          color: 'success'
        })
        await loadCustomers()
        emits('close')
      }
    }
  }
}

</script>

<template>
  <CardsBase
    :loading
    @load="onLoad"
    @edit="onEdit"
    @delete="onDelete"
  >
    <div
      v-if="customer"
      class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <NameInitialsImage
          :name="customer.name"
          class="size-14 shrink-0"
        />
        <div class="min-w-0">
          <h1 class="truncate text-lg font-bold">{{ customer.name }}</h1>
          <span
            v-if="formattedCreatedAt"
            class="text-xs text-dimmed">{{ $t('customer.card.customer_since') }} {{ formattedCreatedAt }}</span>
        </div>
      </div>

      <div
        v-if="customer.email || customer.phone || customer.document"
        class="flex flex-col divide-y divide-accented rounded border border-accented bg-accented/20 dark:bg-accented/30">
        <div
          v-if="customer.email"
          class="flex items-center gap-2 p-2">
          <UIcon
            name="lucide:mail"
            class="size-4 shrink-0 text-dimmed"/>
          <span class="truncate">{{ customer.email }}</span>
        </div>
        <div
          v-if="customer.phone"
          class="flex items-center gap-2 p-2">
          <UIcon
            name="lucide:phone"
            class="size-4 shrink-0 text-dimmed"/>
          <span class="truncate">{{ customer.phone }}</span>
        </div>
        <div
          v-if="customer.document"
          class="flex items-center gap-2 p-2">
          <UIcon
            name="lucide:id-card"
            class="size-4 shrink-0 text-dimmed"/>
          <span class="truncate">{{ customer.document }}</span>
        </div>
      </div>
    </div>
  </CardsBase>
</template>