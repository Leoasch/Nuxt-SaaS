<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { postSale, type SaleBody } from '~/api/sales'
import { PAYMENT_METHOD_ICONS } from '~/common'
import type { Product, SaleLine } from '~~/shared/types'

const props = defineProps<{
  orgId: string
}>()

const PAYMENT_METHODS = ['cash', 'credit_card', 'debit_card', 'pix', 'other'] as const

const { errors, resetErrors, handleError, setError } = useFormErrors([
  'customer_id',
  'payment_method',
  'products'
] as const, 'save')
const { toastApiError } = useApiError()
const { loadSales } = useSales()

const loading = ref(false)
const emit = defineEmits(['close'])

const customer_id = ref<string | null>(null)
const payment_method = ref<string | null>(null)
const lines = ref<(SaleLine & { key: number })[]>([])
const linesList = ref<HTMLElement>()
let nextLineKey = 0

const paymentMethodItems = computed<SelectItem[]>(() => PAYMENT_METHODS.map(method => ({
  label: $t(`sale.payment_method.${method}`),
  value: method,
  icon: PAYMENT_METHOD_ICONS[method]
})))

const total = computed(() => lines.value.reduce((sum, line) => sum + line.unit_price * line.quantity, 0))

async function addProduct (product: Product | null) {
  if (!product) {
    return
  }

  const index = lines.value.push({ key: nextLineKey++, product, quantity: 1, unit_price: product.sale_price }) - 1

  await nextTick()
  linesList.value?.children[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

function removeLine (index: number) {
  lines.value.splice(index, 1)
}

async function save () {
  resetErrors()
  loading.value = true
  try {
    const products = lines.value.map(line => ({
      product_id: line.product.id,
      quantity: line.quantity,
      unit_price: line.unit_price
    }))

    if (products.length === 0) {
      setError('products', 'sale.error.no_products')
      return
    }

    if (!payment_method.value) {
      setError('payment_method', 'sale.error.no_payment_method')
      return
    }

    const body: SaleBody = {
      customer_id: customer_id.value,
      payment_method: payment_method.value,
      products
    }

    await postSale(props.orgId, body)

    await loadSales()
    emit('close')
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
    :title="$t('sale.title.create')"
    :ui="{
      content: 'max-w-3xl'
    }"
    :dismissible="false"
  >
    <template #body>
      <div class="flex flex-col gap-6 max-h-full h-120">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField
            :label="$t('sale.customer')"
            :error="errors.customer_id">
            <CustomerSelector v-model="customer_id"/>
          </UFormField>
          <UFormField
            :label="$t('sale.payment_method_label')"
            :error="errors.payment_method">
            <USelect
              v-model="payment_method"
              :items="paymentMethodItems"
              :icon="payment_method ? PAYMENT_METHOD_ICONS[payment_method] : 'lucide:wallet'"
              :placeholder="$t('sale.payment_method_label')"
              class="w-full"
              :ui="{
                base: 'h-[58px] ps-10',
                leading: 'ps-3'
              }"
            />
          </UFormField>
        </div>

        <UFormField
          :label="$t('sale.products')"
          :error="errors.products"
          :ui="{
            root: 'flex min-h-0 flex-1 flex-col',
            container: 'flex min-h-0 flex-1 flex-col gap-3'
          }">
          <ProductSelector
            reset-on-select
            autofocus
            :placeholder="$t('sale.add_product')"
            @select="addProduct"
          />
          <div
            ref="linesList"
            class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            <ProductsListLine
              v-for="(line, idx) in lines"
              :key="line.key"
              :model-value="line"
              @delete="removeLine(idx)"
            />
            <p
              v-if="lines.length === 0"
              class="m-auto flex items-center gap-2 text-sm text-dimmed">
              <UIcon
                name="lucide:shopping-cart"
                class="size-4"/>
              {{ $t('sale.no_products_added') }}
            </p>
          </div>
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <span class="text-lg font-bold">{{ $t('sale.total_value', { total: $n(total, 'currency') }) }}</span>
        <UButton
          :loading="loading"
          @click="save">
          {{ $t('sale.save.create') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
