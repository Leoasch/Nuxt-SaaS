<script setup lang="ts">
import PendingInvites from '~/components/Widgets/PendingInvites.vue'

</script>

<template>
  <div class="size-full grid grid-cols-4 grid-rows-4 gap-2">
    <PendingInvites class="col-span-1 row-span-2"/>
    <PendingInvites class="col-span-2 row-span-1"/>
    <PendingInvites class="col-span-1 row-span-2"/>
    <PendingInvites class="col-span-2 row-span-1"/>
  </div>
</template>
