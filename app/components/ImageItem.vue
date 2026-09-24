<script setup lang="ts">
import ImageDisplayModal from './ImageDisplayModal.vue'
import type { ImageEntry } from '~/api/products'

const props = defineProps<{
  entry: ImageEntry
}>()

defineEmits(['remove'])

const overlay = useOverlay()
const { t, n } = useI18n()

const imageUrl = computed(() => props.entry.type === 'new'
  ? URL.createObjectURL(props.entry.file)
  : props.entry.url)

const label = computed(() => props.entry.type === 'new'
  ? props.entry.file.name
  : props.entry.mimeType)

const fileSize = computed(() => {
  const size = props.entry.type === 'new' ? props.entry.file.size : props.entry.size

  if (size < 1024) {
    return t('images.size.b', { size: n(size, 'integer') })
  } else if (size < 1024 * 1024) {
    return t('images.size.kb', { size: n(size / 1024, 'decimal') })
  } else {
    return t('images.size.mb', { size: n(size / (1024 * 1024), 'decimal') })
  }
})

function displayImage () {
  overlay.create(ImageDisplayModal, {
    props: { imageUrl: imageUrl.value }
  }).open()
}
</script>

<template>
  <div class="flex h-20 p-1 rounded border border-accented">
    <img
      :src="imageUrl"
      :alt="label"
      class="w-30 h-full shrink-0 object-cover rounded">
    <div class="flex items-center mx-2 flex-1 min-w-0">
      <div class="flex flex-col min-w-0">
        <h1 class="text-sm font-bold truncate">{{ label }}</h1>
        <h2 class="text-xs text-dimmed">{{ fileSize }}</h2>
      </div>
      <div class="mr-2 ml-auto">
        <UButton
          icon="lucide:eye"
          color="secondary"
          class="cursor-pointer"
          variant="ghost"
          :aria-label="$t('images.view')"
          @click="displayImage"
        />
        <UButton
          icon="lucide:trash"
          color="error"
          class="cursor-pointer"
          variant="ghost"
          :aria-label="$t('images.remove')"
          @click="() => $emit('remove')"
        />
      </div>
    </div>
  </div>
</template>
