<script setup lang="ts">
import { editCustomer, postCustomer, type CustomerBody } from '~/api/customers'
import type { Customer } from '~~/shared/types'

const props = defineProps<{
  customer?: Customer,
  orgId: string
}>()

const { errors, resetErrors, handleError } = useFormErrors([
  'name',
  'email',
  'phone',
  'document',
] as const, 'save')
const { toastApiError } = useApiError()
const { loadCustomers } = useCustomers()

const iconInputUi = { base: 'py-2 ps-10 pe-4', leading: 'ps-3' }

const type = computed(() => props.customer ? 'edit' : 'create')
const loading = ref(false)
const emit = defineEmits(['close'])

const form = ref<CustomerBody>({
  id: props.customer?.id,
  name: props.customer?.name ?? '',
  email: props.customer?.email ?? '',
  phone: props.customer?.phone ?? '',
  document: props.customer?.document ?? ''
})

async function save () {
  resetErrors()
  loading.value = true
  try {
    const body = nullifyEmpty(form.value)

    if (body.id) {
      await editCustomer(props.orgId, body)
    } else {
      await postCustomer(props.orgId, body)
    }

    await loadCustomers()
    emit('close', true)
  } catch (error: any) {
    handleError(error)
    toastApiError(error, $t('common.save_failed'))
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <UModal
    :title="$t(`customer.title.${type}`)"
    :ui="{
      content: 'max-w-3xl'
    }"
    :dismissible="false"
  >
    <template #body>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField
          :label="$t('customer.name')"
          :error="errors.name">
          <UInput
            v-model="form.name"
            icon="lucide:user"
            :placeholder="$t('customer.name')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
        <UFormField
          :label="$t('customer.email')"
          :error="errors.email">
          <UInput
            v-model="form.email!"
            icon="lucide:mail"
            :placeholder="$t('customer.email')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
        <UFormField
          :label="$t('customer.document')"
          :error="errors.document">
          <UInput
            v-model="form.document!"
            icon="lucide:id-card"
            :placeholder="$t('customer.document')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
        <UFormField
          :label="$t('customer.phone')"
          :error="errors.phone">
          <UInput
            v-model="form.phone!"
            icon="lucide:phone"
            :placeholder="$t('customer.phone')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          :loading
          @click="save">
          {{ $t(`customer.save.${type}`) }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>