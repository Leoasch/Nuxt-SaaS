<script setup lang="ts">
import { cancelSale, getSales } from '~/api/sales'
import { PAYMENT_METHOD_ICONS, priceFormatter } from '~/common'
import CustomerCard from './CustomerCard.vue'
import ConfirmDeleteDialog from '../ConfirmDeleteDialog.vue'

const props = defineProps<{
  saleId: string
}>()

const sale = ref<Sale | null>(null)
const loading = ref(false)
const { selectedOrganizationId } = useOrganization()
const { loadSales } = useSales()
const customer = computed(() => sale.value?.customer ?? null)
const paymentMethodIcon = computed(() => PAYMENT_METHOD_ICONS[sale.value?.payment_method ?? ''] ?? 'lucide:circle-dollar-sign')
const formattedTotal = computed(() => sale.value ? priceFormatter.format(sale.value.total) : '')
const overlay = useOverlay()

async function onLoad () {
  try {
    loading.value = true
    if (selectedOrganizationId.value) {
      const result = await getSales(selectedOrganizationId.value, props.saleId)
      if (result.sale) {
        sale.value = result.sale
      }
    }
  } finally {
    loading.value = false
  }
}

function openCustomerCard (id: string) {
  overlay.create(CustomerCard, { props: { customerId: id } }).open()
}

async function onCancel () {
  if (!sale.value || !selectedOrganizationId.value) {
    return
  }

  const dialog = overlay.create(ConfirmDeleteDialog, {
    props: {
      title: $t('sale.confirm_cancel.title'),
      description: $t('sale.confirm_cancel.description'),
    }
  }).open()

  if (await dialog.result) {
    loading.value = true
    try {
      const result = await cancelSale(selectedOrganizationId.value, sale.value.id)
      if (result.sale) {
        sale.value = result.sale
        useToast().add({
          description: $t('sale.cancel_success'),
          color: 'success'
        })
        await loadSales()
      }
    } finally {
      loading.value = false
    }
  }
}

</script>

<template>
  <CardsBase
    :can-delete="false"
    :can-edit="false"
    :loading
    @load="onLoad"
  >
    <div
      v-if="sale"
      class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-2">
        <div class="flex min-w-0 items-center gap-2">
          <NameInitialsImage
            v-if="customer"
            :name="customer.name"
            class="size-8 shrink-0"
          />
          <div
            v-else
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-accented/50 text-dimmed">
            <UIcon
              name="lucide:shopping-cart"
              class="size-4"/>
          </div>
          <span
            class="truncate font-semibold"
            :class="customer ? 'cursor-pointer' : ''"
            @click="() => customer ? openCustomerCard(customer.id) : ''"
          >{{ customer?.name ?? $t('sale.walk_in_customer') }}</span>
        </div>
        <UBadge
          color="neutral"
          variant="subtle"
          :icon="paymentMethodIcon">
          {{ $t(`sale.payment_method.${sale.payment_method}`) }}
        </UBadge>
      </div>
      <div
        v-if="sale.canceled_at"
        class="flex items-center gap-2 rounded border border-error/30 bg-error-500/10 p-2 text-error">
        <UIcon
          name="lucide:ban"
          class="size-4 shrink-0"/>
        <span class="text-sm font-medium">{{ $t('sale.canceled_at') }}: {{ (new Date(sale.canceled_at)).toLocaleString() }}</span>
      </div>
      <div class="flex flex-col divide-y divide-accented rounded border border-accented bg-accented/20 dark:bg-accented/30">
        <div
          v-for="saleItem in sale.sale_items"
          :key="saleItem.id"
          class="flex items-center gap-3 p-2">
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate font-medium">{{ saleItem.product?.name ?? $t('sale.unknown_product') }}</span>
            <span class="text-xs text-dimmed">
              {{ saleItem.quantity }} × {{ priceFormatter.format(saleItem.unit_price) }}
              <span
                v-if="saleItem.original_unit_price > saleItem.unit_price"
                class="ml-1 line-through">{{ priceFormatter.format(saleItem.original_unit_price) }}</span>
            </span>
          </div>
          <span class="shrink-0 font-semibold">{{ priceFormatter.format(saleItem.total) }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between px-1">
        <span class="font-bold">{{ $t('sale.total') }}</span>
        <span class="text-lg font-bold">{{ formattedTotal }}</span>
      </div>
      <span 
        v-if="sale?.createdAt" 
        class="text-dimmed text-sm"
      >
        {{ $t('sale.card.created_at') }}: {{ (new Date(sale.createdAt)).toLocaleString() }}
      </span>
    </div>
    <template #footer-btns>
      <UButton
        v-if="sale && !sale.canceled_at"
        icon="lucide:x"
        :disabled="loading"
        variant="ghost"
        color="secondary"
        class="cursor-pointer"
        @click="onCancel"
      >
        {{ $t('sale.card.cancel') }}
      </UButton>
    </template>
  </CardsBase>
</template>