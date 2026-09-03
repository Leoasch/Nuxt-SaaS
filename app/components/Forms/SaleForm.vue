<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { postSale, type SaleBody } from '~/api/sales'
import { emptyLine, priceFormatter } from '~/common'
import type { Product, SaleLine } from '~~/shared/types'

const props = defineProps<{
  orgId: string
}>()

const PAYMENT_METHODS = ['cash', 'credit_card', 'debit_card', 'pix', 'other'] as const

const { errors, resetErrors, handleError } = useFormErrors([
  'customer_id',
  'payment_method',
  'products'
] as const, 'save')
const { loadSales } = useSales()

const loading = ref(false)
const emit = defineEmits(['close'])

const customer_id = ref<string | null>(null)
const payment_method = ref<string | null>(null)
const lines = ref<SaleLine[]>([emptyLine()])

const paymentMethodItems = computed<SelectItem[]>(() => PAYMENT_METHODS.map(method => ({
  label: $t(`sale.payment_method.${method}`),
  value: method
})))

function lineTotal (line: SaleLine) {
  return line.unit_price * line.quantity
}

const total = computed(() => lines.value.reduce((sum, line) => sum + lineTotal(line), 0))

function onSelectProduct (line: SaleLine, product: Product | null) {
  line.product = product
  line.unit_price = product?.sale_price ?? 0
}

function addLine () {
  lines.value.push(emptyLine())
}

function removeLine (index: number) {
  lines.value.splice(index, 1)
}

async function save () {
  resetErrors()
  loading.value = true
  try {
    const products = lines.value
      .filter(line => line.product_id)
      .map(line => ({
        product_id: line.product_id!,
        quantity: line.quantity,
        unit_price: line.unit_price
      }))

    if (products.length === 0) {
      errors.products = $t('sale.error.no_products')
      return
    }

    if (!payment_method.value) {
      errors.payment_method = $t('sale.error.no_payment_method')
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
    :title="$t('sale.title.create')"
    :ui="{
      content: 'max-w-3xl'
    }">
    <template #body>
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField
            :label="$t('sale.customer')"
            :error="errors.customer_id">
            <CustomerSelector v-model="customer_id"/>
          </UFormField>
          <UFormField
            :label="$t('sale.payment_method.label')"
            :error="errors.payment_method">
            <USelect
              v-model="payment_method"
              :items="paymentMethodItems"
              :placeholder="$t('sale.payment_method.label')"
              class="w-full"
              :ui="{ base: 'h-[58px]' }"
            />
          </UFormField>
        </div>

        <UFormField
          :label="$t('sale.products')"
          :error="errors.products">
          <div class="flex flex-col gap-3">
            <ProductsListLine
              v-for="(line, idx) in lines"
              :key="idx"
              :can-delete="lines.length > 1"
              :model-value="line"
              @select="product => onSelectProduct(line, product)"
              @delete="removeLine(idx)"
            />
            <UButton
              variant="ghost"
              icon="lucide:plus"
              class="self-start"
              @click="addLine">
              {{ $t('sale.add_product') }}
            </UButton>
          </div>
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <span class="text-lg font-bold">{{ $t('sale.total') }}: {{ priceFormatter.format(total) }}</span>
        <UButton
          :loading="loading"
          @click="save">
          {{ $t('sale.save.create') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
