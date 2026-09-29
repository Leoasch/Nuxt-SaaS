<script setup lang="ts">
import type { SaleLine } from '~~/shared/types'

const line = defineModel<SaleLine>({ required: true })

defineEmits<{ delete: [] }>()

const lineTotal = computed(() => line.value.unit_price * line.value.quantity)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 rounded border border-accented p-2 sm:flex-nowrap">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <ImageCarousel
        :org-id="line.product.organization_id"
        :product-id="line.product.id"
        :product-name="line.product.name"
        :images="line.product.images ?? []"
        class="size-10 shrink-0 border border-accented/50"
      />
      <div class="flex min-w-0 flex-1 flex-col">
        <span class="truncate font-bold">{{ line.product.name }}</span>
        <span class="flex min-w-0 items-center gap-x-3 overflow-hidden text-xs text-dimmed">
          <span
            v-if="line.product.sku"
            class="flex min-w-0 items-center gap-1">
            <UIcon
              name="lucide:tag"
              class="size-3.5 shrink-0"/>
            <span class="truncate">{{ line.product.sku }}</span>
          </span>
          <span
            class="flex shrink-0 items-center gap-1"
            :class="line.quantity > line.product.stock_quantity ? 'text-error' : ''">
            <UIcon
              name="lucide:package"
              class="size-3.5 shrink-0"/>
            {{ line.product.stock_quantity }}
          </span>
        </span>
      </div>
    </div>
    <div class="order-last flex w-full items-center gap-2 sm:order-none sm:w-auto">
      <AmountInput
        v-model="line.quantity"
        :min="1"
        :label="$t('sale.quantity')"
        helpers
      />
      <PriceInput
        v-model="line.unit_price"
        class="min-w-0 flex-1 sm:w-32 sm:flex-none"
        :placeholder="$t('sale.unit_price')"
      />
      <span class="hidden w-28 shrink-0 text-right text-sm text-dimmed sm:block">
        {{ $n(lineTotal, 'currency') }}
      </span>
    </div>
    <span class="shrink-0 text-sm text-dimmed sm:hidden">
      {{ $n(lineTotal, 'currency') }}
    </span>
    <UButton
      icon="lucide:trash-2"
      color="error"
      variant="ghost"
      :aria-label="$t('sale.remove_product')"
      @click="() => $emit('delete')"
    />
  </div>
</template>
