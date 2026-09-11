<script setup lang="ts">

withDefaults(defineProps<{
  loading?: boolean
  canEdit?: boolean
  canDelete?: boolean
}>(), {
  canEdit: true,
  canDelete: true
})

const emits = defineEmits(['load', 'delete', 'edit'])

async function load () {
  emits('load')
}

onMounted( async () => {
  await load()
})
</script>

<template>
  <UModal
    :ui="{
      content: 'max-w-3xl',
      body: 'sm:p-4'

    }">
    <template #body>
      <Loadable :loading>
        <slot/>
      </Loadable>
    </template>
    <template #footer>
      <div class="flex flex-col w-full">
        <div class="flex gap-2 w-full justify-end">
          <slot name="footer-btns"/>
          <UButton
            v-if="canEdit"
            icon="lucide:pencil" 
            :disabled="loading"
            variant="ghost"
            color="warning"
            class="cursor-pointer"
            @click="$emit('edit')"
          >{{ $t('edit') }}</UButton>
          <UButton 
            v-if="canDelete"
            icon="lucide:trash" 
            :disabled="loading"
            variant="ghost"
            color="error"
            class="cursor-pointer"
            @click="$emit('delete')"
          >{{ $t('delete') }}</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>