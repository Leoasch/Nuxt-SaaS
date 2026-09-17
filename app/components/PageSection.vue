<script setup lang="ts">

defineProps<{
  title?: string
}>()

</script>

<template>
  <div class="w-full">
    <h1 
      v-if="title" 
      class="font-bold"
    >{{ title }}</h1>
    <div class="w-full border border-accented shadow-2xl p-2 rounded">
      <slot/>
    </div>
  </div>
</template>