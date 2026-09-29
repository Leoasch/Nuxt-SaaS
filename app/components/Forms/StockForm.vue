<script setup lang="ts">

import { postStockMV } from '~/api/stockMovements'
import type { Product } from '~~/shared/types'

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

const product_id = ref<string | null>(null)
const product = ref<Product | null>(null)
const direction = ref<'in' | 'out'>('in')
const quantity = ref(1)
const reason = ref('')

const directions = [
  { value: 'in', icon: 'lucide:arrow-up', color: 'success' },
  { value: 'out', icon: 'lucide:arrow-down', color: 'error' }
] as const

const signedQuantity = computed(() => direction.value === 'in' ? quantity.value : -quantity.value)
const stockAfter = computed(() => product.value ? product.value.stock_quantity + signedQuantity.value : 0)

function onSelectProduct (selected: Product | null) {
  product.value = selected
  resetErrors()
}

async function save () {
  resetErrors()

  if (!product_id.value) {
    setError('product', 'errors.PRODUCT_ID_MISSING')
    return
  }

  loading.value = true
  try {
    await postStockMV(props.orgId, nullifyEmpty({
      product_id: product_id.value,
      quantity: signedQuantity.value,
      reason: reason.value
    }))

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
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UFormField
          :label="$t('stock.product')"
          :error="errors.product"
          class="sm:col-span-2">
          <ProductSelector
            v-model="product_id"
            autofocus
            @select="onSelectProduct"
          />
        </UFormField>
        <UFormField :label="$t('stock.direction.label')">
          <UFieldGroup class="w-full">
            <UButton
              v-for="item in directions"
              :key="item.value"
              :icon="item.icon"
              :color="direction === item.value ? item.color : 'neutral'"
              :variant="direction === item.value ? 'subtle' : 'outline'"
              :aria-pressed="direction === item.value"
              class="flex-1 justify-center py-2"
              @click="direction = item.value">
              {{ $t(`stock.direction.${item.value}`) }}
            </UButton>
          </UFieldGroup>
        </UFormField>
        <UFormField
          :label="$t('stock.quantity')"
          :error="errors.quantity">
          <QuantityInput
            v-model="quantity"
            :min="1"
            icon="lucide:boxes"
            :placeholder="$t('stock.quantity')"
          />
        </UFormField>
        <div
          v-if="product"
          class="flex items-center gap-2 rounded-md bg-elevated/60 px-3 py-2 text-sm sm:col-span-2">
          <UIcon
            name="lucide:package"
            class="size-4 shrink-0 text-dimmed"/>
          <span class="text-muted">{{ $t('stock.stock_after') }}</span>
          <span class="ml-auto font-medium">{{ product.stock_quantity }}</span>
          <UIcon
            name="lucide:arrow-right"
            class="size-4 shrink-0 text-dimmed"/>
          <span
            class="font-bold"
            :class="stockAfter < 0 ? 'text-error' : stockAfter <= product.minimum_stock ? 'text-warning' : 'text-highlighted'">
            {{ stockAfter }}
          </span>
        </div>
        <UFormField
          :label="$t('stock.reason')"
          :error="errors.reason"
          class="sm:col-span-2">
          <UTextarea
            v-model="reason"
            icon="lucide:message-square-text"
            :rows="3"
            :placeholder="$t('stock.reason_placeholder')"
            class="w-full"
            :ui="{
              base: 'py-2 ps-10 pe-4',
              leading: 'ps-3'
            }"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          :loading
          @click="save">
          {{ $t('stock.save.create') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
