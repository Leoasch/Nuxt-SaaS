<script setup lang="ts">
const props = withDefaults(defineProps<{
  total: number
  limit?: number
  loading?: boolean
  hidePagination?: boolean
}>(), {
  limit: 10
})

const index = defineModel<number>({ default: 0 })

const page = computed({
  get: () => Math.floor(index.value / props.limit) + 1,
  set: (value: number) => {
    index.value = (value - 1) * props.limit
  }
})

</script>


<template>
  <div class="w-full flex-1 min-h-0 flex flex-col items-center">
    <Loadable
      :loading 
      class="w-full flex-1 min-h-0 overflow-auto px-4"
    >
      <slot/>
    </Loadable>
    <UPagination
      v-if="!hidePagination"
      v-model:page="page"
      :total
      :items-per-page="limit"
      class="shrink-0 pt-2"
    />
  </div>
</template>