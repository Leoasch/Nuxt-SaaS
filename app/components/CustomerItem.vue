<script setup lang="ts">
import type { DisplayType } from '~~/shared/types'
import CustomerForm from './Forms/CustomerForm.vue'

const props = defineProps<{
  customer: Customer,
  displayType: DisplayType
}>()

const overlay = useOverlay()

function editModal () {
  overlay.create(CustomerForm, { props: {
    customer: props.customer, orgId: props.customer.organization_id
  } }).open()
}

const initials = computed(() => props.customer.name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0]!.toUpperCase())
  .join(''))
</script>

<template>
  <div
    class="cursor-pointer rounded border border-accented bg-accented/20 p-2 flex gap-3 hover:bg-accented/40 hover:scale-105 transition-all duration-100"
    :class="displayType === 'grid' ? 'flex-col h-30' : 'w-full items-center h-15'"
    @click="editModal">

    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary"
      :class="displayType === 'grid' ? 'mx-auto' : ''"
    >
      {{ initials }}
    </div>

    <div
      class="flex min-w-0 flex-1 flex-col justify-center gap-0.5"
      :class="displayType === 'grid' ? 'items-center' : ''">
      <h1 class="truncate font-bold">{{ customer.name }}</h1>

      <div
        class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-dimmed"
        :class="displayType === 'grid' ? 'justify-center' : ''">
        <span
          v-if="customer.email"
          class="flex min-w-0 items-center gap-1">
          <UIcon
            name="lucide:mail"
            class="size-3.5 shrink-0"/>
          <span class="truncate">{{ customer.email }}</span>
        </span>
        <span
          v-if="customer.phone"
          class="flex shrink-0 items-center gap-1">
          <UIcon
            name="lucide:phone"
            class="size-3.5 shrink-0"/>
          {{ customer.phone }}
        </span>
        <span
          v-if="customer.document"
          class="flex shrink-0 items-center gap-1">
          <UIcon
            name="lucide:id-card"
            class="size-3.5 shrink-0"/>
          {{ customer.document }}
        </span>
      </div>
    </div>
  </div>
</template>
