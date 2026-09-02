<script setup lang="ts">
import type { Sale } from '~~/shared/types'

const props = defineProps<{
  sale: Sale
}>()

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: 'lucide:banknote',
  credit_card: 'lucide:credit-card',
  debit_card: 'lucide:credit-card',
  pix: 'lucide:qr-code',
  other: 'lucide:circle-dollar-sign'
}

const { customers } = useCustomers()

const customer = computed(() => customers.value.find(c => c.id === props.sale.customer_id) ?? null)

const itemCount = computed(() => props.sale.sale_items?.length ?? 0)

const paymentMethodIcon = computed(() => PAYMENT_METHOD_ICONS[props.sale.payment_method] ?? 'lucide:circle-dollar-sign')

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const formattedTotal = computed(() => priceFormatter.format(props.sale.total))
const formattedDate = computed(() => props.sale.createdAt ? dateFormatter.format(new Date(props.sale.createdAt)) : '')
</script>

<template>
  <div
    class="rounded border w-full items-center border-accented bg-accented/20 p-2 flex gap-3 hover:bg-accented/40 hover:scale-102 transition-all duration-300">
    <NameInitialsImage
      v-if="customer"
      :name="customer.name"
      class="size-10 shrink-0"
    />
    <div
      v-else
      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-accented/50 text-dimmed">
      <UIcon
        name="lucide:shopping-cart"
        class="size-5"/>
    </div>

    <div class="flex min-w-0 flex-1 flex-col justify-center">
      <h1 class="truncate font-bold">{{ customer?.name ?? $t('sale.walk_in_customer') }}</h1>
      <span class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-dimmed">
        <span
          v-if="formattedDate"
          class="truncate">{{ formattedDate }}</span>
        <span>{{ itemCount }} {{ $t('sale.items_count') }}</span>
      </span>
    </div>

    <div class="flex shrink-0 items-center gap-2 mr-2">
      <UBadge
        color="neutral"
        variant="subtle"
        :icon="paymentMethodIcon">
        {{ $t(`sale.payment_method.${sale.payment_method}`) }}
      </UBadge>
      <span class="font-bold">{{ formattedTotal }}</span>
    </div>
  </div>
</template>
