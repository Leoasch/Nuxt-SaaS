<script setup lang="ts">
import { PAYMENT_METHOD_ICONS } from '~/common'
import type { Sale } from '~~/shared/types'

const props = defineProps<{
  sale: Sale
}>()

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
    class="rounded border w-full items-center border-accented bg-accented/20 p-2 flex gap-3 hover:bg-accented/40 hover:scale-102 transition-all duration-300"
    :class="sale.canceled_at ? 'opacity-60' : ''">
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

    <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
      <div class="flex min-w-0 items-center gap-2">
        <h1 class="min-w-0 flex-1 truncate font-bold">{{ customer?.name ?? $t('sale.walk_in_customer') }}</h1>
        <UBadge
          v-if="sale.canceled_at"
          color="error"
          variant="subtle"
          icon="lucide:ban"
          class="shrink-0">
          {{ $t('sale.canceled') }}
        </UBadge>
        <span class="shrink-0 font-bold">{{ formattedTotal }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dimmed">
        <span
          v-if="formattedDate"
          class="truncate">{{ formattedDate }}</span>
        <span class="shrink-0">{{ itemCount }} {{ $t('sale.items_count') }}</span>
        <UBadge
          color="neutral"
          variant="subtle"
          :icon="paymentMethodIcon"
          class="ml-auto shrink-0">
          {{ $t(`sale.payment_method.${sale.payment_method}`) }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
