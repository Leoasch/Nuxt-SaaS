<script setup lang="ts">
import type { StockMovement } from '~~/shared/types'

const props = defineProps<{
  movement: StockMovement
}>()

const isPositiveStock = computed(() => props.movement.quantity >= 0)
</script>

<template>
  <div
    class="
      cursor-pointer rounded border border-accented p-2 flex w-full items-center gap-3 
       hover:scale-102 transition-all duration-300 
    "
    :class="isPositiveStock ? 
      'bg-success-700/5 border-success-500/20 hover:bg-success-600/20' : 
      'bg-error-700/5 border-error-500/20 hover:bg-error-600/20'"
  >

    <div class="flex min-w-0 flex-1 flex-col justify-center">
      <h1 class="truncate font-bold">{{ movement.product_name }}</h1>
      <h1 class="truncate text-dimmed text-sm">{{ movement.reason }}</h1>
    </div>

    <div class="flex items-center gap-2 mr-2 justify-between">
      <UBadge
        :color="isPositiveStock ? 'success' : 'error'"
        variant="subtle"
        :icon="isPositiveStock ? 'lucide:arrow-up' : 'lucide:arrow-down'">
        {{ movement.quantity }}
      </UBadge>
    </div>
  </div>
</template>
