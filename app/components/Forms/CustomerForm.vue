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
const { loadCustomers } = useCustomers()

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
    emit('close')
  } catch (error: any) {

    handleError(error)
    if (errors.save) {
      useToast().add({
        description: `${ $t('save.error') }: ${$t(errors.save)}`,
        color: 'error'
      })
    }

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
    }">
    <template #body>
      <div class="grid grid-cols-2 gap-x-4 gap-y-6">
        <UFormField
          :label="$t('customer.name')"
          :error="errors.name"
          class="col-span-2">
          <UInput
            v-model="form.name"
            :placeholder="$t('customer.name')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('customer.email')"
          :error="errors.email"
          class="col-span-2">
          <UInput
            v-model="form.email!"
            :placeholder="$t('customer.email')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('customer.document')"
          :error="errors.document">
          <UInput
            v-model="form.document!"
            :placeholder="$t('customer.document')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('customer.phone')"
          :error="errors.phone">
          <UInput
            v-model="form.phone!"
            :placeholder="$t('customer.phone')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton @click="save">
          {{ $t(`customer.save.${type}`) }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>