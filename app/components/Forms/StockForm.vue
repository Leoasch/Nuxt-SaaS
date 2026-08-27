<script setup lang="ts">

import { postStockMV, type StockMVBody } from '~/api/stockMovements'

const props = defineProps<{
  orgId: string
}>()

const { errors, resetErrors, handleError } = useFormErrors([
  'quantity',
  'reason',
  'product'
] as const, 'save')
const { loadStock } = useStock()

const loading = ref(false)
const emit = defineEmits(['close'])

const form = ref<StockMVBody>({
  quantity: 0,
  reason: '',
  product_id: null
})

async function save () {
  resetErrors()
  loading.value = true
  try {
    const body = nullifyEmpty(form.value)

    
    await postStockMV(props.orgId, body)

    await loadStock()
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
    :title="$t('stock.title.create')"
    :ui="{
      content: 'max-w-3xl'
    }">
    <template #body>
      <div class="flex flex-col gap-6">
        
        
        <UFormField
          :label="$t('stock.product')"
          :error="errors.product">
          <ProductSelector v-model="form.product_id"/>
        </UFormField>
        <UFormField
          :label="$t('stock.reason')"
          :error="errors.reason">
          <UInput
            v-model="form.reason!"
            :placeholder="$t('stock.reason')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('stock.quantity')"
          :error="errors.quantity">
          <UInput
            v-model="form.quantity"
            type="number"
            :placeholder="$t('stock.quantity')"
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
          {{ $t('stock.save.create') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>