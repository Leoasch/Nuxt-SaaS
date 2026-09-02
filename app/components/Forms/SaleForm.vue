<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { postSale, type SaleBody } from '~/api/sales'
import type { Product } from '~~/shared/types'

const props = defineProps<{
  orgId: string
}>()

const PAYMENT_METHODS = ['cash', 'credit_card', 'debit_card', 'pix', 'other'] as const

type SaleLine = {
  product_id: string | null
  product: Product | null
  quantity: number
  unit_price: number
}

function emptyLine (): SaleLine {
  return { product_id: null, product: null, quantity: 1, unit_price: 0 }
}

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

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

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
        <div class="grid grid-cols-2 gap-4">
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
            />
          </UFormField>
        </div>

        <UFormField
          :label="$t('sale.products')"
          :error="errors.products">
          <div class="flex flex-col gap-3">
            <div
              v-for="(line, index) in lines"
              :key="index"
              class="flex items-start gap-2">
              <div class="flex-1">
                <ProductSelector
                  v-model="line.product_id"
                  @select="product => onSelectProduct(line, product)"
                />
              </div>
              <UInput
                v-model.number="line.quantity"
                type="number"
                :min="1"
                class="w-20"
                :placeholder="$t('sale.quantity')"
              />
              <PriceInput
                v-model="line.unit_price"
                class="w-32"
                :placeholder="$t('sale.unit_price')"
              />
              <span class="w-28 shrink-0 pt-2 text-right text-sm text-dimmed">
                {{ priceFormatter.format(lineTotal(line)) }}
              </span>
              <UButton
                icon="lucide:trash-2"
                color="error"
                variant="ghost"
                :disabled="lines.length === 1"
                @click="removeLine(index)"
              />
            </div>

            <UButton
              variant="ghost"
              icon="lucide:plus"
              class="self-start"
              @click="addLine">
              {{ $t('sale.add_product') }}
            </UButton>
          </div>
        </UFormField>

        <div class="flex justify-end border-t border-accented pt-3 text-lg font-bold">
          {{ $t('sale.total') }}: {{ priceFormatter.format(total) }}
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          :loading="loading"
          @click="save">
          {{ $t('sale.save.create') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
