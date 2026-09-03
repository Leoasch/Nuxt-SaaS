<script setup lang="ts">
import { emptyLine, priceFormatter } from '~/common'
import type { SaleLine } from '~~/shared/types'

defineProps<{
  canDelete?: boolean
}>()

const line = defineModel<SaleLine>({ default: () => emptyLine() })

function lineTotal (line: SaleLine) {
  return line.unit_price * line.quantity
}

defineEmits<{ select: [product: Product | null], delete: [] }>()

</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
    <div class="min-w-0 flex-1">
      <ProductSelector
        v-model="line.product_id"
        @select="product => $emit('select', product)"
      />
    </div>
    <div class="flex items-center gap-2">
      <!-- <UInput
        v-model.number="line.quantity"
        type="number"
        class="w-16 sm:w-20"
        :placeholder="$t('sale.quantity')"
        /> -->
      <AmountInput
        v-model="line.quantity"
        :min="1"
        helpers
      />
      <PriceInput
        v-model="line.unit_price"
        class="w-24 sm:w-32"
        :placeholder="$t('sale.unit_price')"
      />
      <span class="w-20 shrink-0 text-right text-sm text-dimmed sm:w-28">
        {{ priceFormatter.format(lineTotal(line)) }}
      </span>
      <UButton
        icon="lucide:trash-2"
        color="error"
        variant="ghost"
        :disabled="!canDelete"
        @click="() => $emit('delete')"
      />
    </div>
  </div>
</template>