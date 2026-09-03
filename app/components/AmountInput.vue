<script setup lang="ts">

const props = defineProps<{
  helpers?: boolean
  min?: number
}>()

const model = defineModel<number>({ default: () => 1 })

function toNumber (value: number | string) {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return Number.isFinite(n) ? n : 0
}

const canSubtract = computed(() => props.min === undefined || props.min < toNumber(model.value))

function add () {
  const next = toNumber(model.value) + 1
  model.value = props.min !== undefined ? Math.max(next, props.min) : next
}

function subtract () {
  if (!canSubtract.value) {
    return
  }
  const next = toNumber(model.value) - 1
  model.value = props.min !== undefined ? Math.max(next, props.min) : next
}

function onBlur () {
  model.value = toNumber(model.value)
  if (props.min !== undefined && model.value < props.min) {
    model.value = props.min
  }
}

</script>

<template>
  <div class="flex items-center gap-1">
    <UIcon
      v-if="helpers"
      name="lucide:minus"
      class="size-6 bg-error-500"
      :class="canSubtract ? '' : 'bg-neutral-500 cursor-not-allowed'"
      @click="subtract"
    />
    <UInput
      v-model.number="model"
      type="number"
      :min="min"
      class="w-16 sm:w-20 text-center"
      :ui="{
        base: 'text-center py-2 px-4 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
      }"
      @blur="onBlur"
    />
    <UIcon
      v-if="helpers"
      name="lucide:plus"
      class="size-6 bg-success-500"
      @click="add"
    />
  </div>
</template>