<script setup lang="ts">

import { postStockMV, type StockMVBody } from '~/api/stockMovements'

const props = defineProps<{
  orgId: string
}>()

const { errors, resetErrors, handleError, setError } = useFormErrors([
  'quantity',
  'reason',
  'product'
] as const, 'save')
const { toastApiError } = useApiError()
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

    // the product comes from the query string, so the server reports it as a top-level code
    const code = error?.data?.data?.code
    if (code === 'PRODUCT_ID_MISSING' || code === 'PRODUCT.NOT_FOUND') {
      setError('product', `errors.${code}`)
    }

    toastApiError(error, $t('common.save_failed'))
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
    }"
    :dismissible="false">
    <template #body>
      <div class="flex flex-col gap-6">
        
        
        <UFormField
          :label="$t('stock.product')"
          :error="errors.product">
          <ProductSelector v-model="form.product_id"/>
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
        <UFormField
          :label="$t('stock.reason')"
          :error="errors.reason">
          <UTextarea
            v-model="form.reason!"
            :placeholder="$t('stock.reason')"
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