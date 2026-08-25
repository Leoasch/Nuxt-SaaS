<script setup lang="ts">
import type { DisplayType } from '~~/shared/types'

const displayType = defineModel<DisplayType>({ default: () => 'list' })
</script>

<template>
  <div class="w-25 h-9 border border-accented rounded flex">
    <div
      :class="`
        flex items-center justify-center w-full p-1 cursor-pointer hover:bg-accented/40 transition-all duration-300
        ${displayType === 'list' ? 'bg-accented/30' : ''}
      `"
      @click="() => displayType = 'list'">
      <UIcon
        :class="`
           size-full
          ${displayType === 'list' ? 'dark:bg-neutral-50 bg-neutral-950' : 'opacity-50'}
        `"
        name="lucide:list"
        
      />
    </div>
    <div
      :class="`
        flex items-center justify-center w-full p-1 cursor-pointer hover:bg-accented/40 transition-all duration-300
        ${displayType === 'grid' ? 'bg-accented/30' : ''}
      `"
      @click="() => displayType = 'grid'">
      <UIcon
        :class="`
           size-full
          ${displayType === 'grid' ? 'dark:bg-neutral-50 bg-neutral-950' : 'opacity-50'}
        `"
        name="lucide:layout-grid"
        
      />
    </div>
  </div>
</template>