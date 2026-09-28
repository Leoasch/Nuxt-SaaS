<script setup lang="ts">
import { deleteProductImage, type ImageEntry } from '~/api/products'
import { MAX_IMAGE_SIZE, MAX_IMAGES_PER_PRODUCT } from '~~/shared/utils/uploads'

const props = defineProps<{
  orgId: string
  productId?: string
}>()

const entries = defineModel<ImageEntry[]>({ default: () => [] })

const inputRef = ref<HTMLInputElement>()
const { toastApiError } = useApiError()
const toast = useToast()
const { t } = useI18n()

const isFull = computed(() => (entries.value?.length ?? 0) >= MAX_IMAGES_PER_PRODUCT)

function openPicker () {
  inputRef.value?.click()
}

function onChange (event: Event) {
  const input = event.target as HTMLInputElement

  addFiles(input.files ? Array.from(input.files) : [])

  input.value = ''
}

function addFiles (newFiles: File[]) {
  const current = entries.value ?? []
  const withinSize = newFiles.filter(file => file.size <= MAX_IMAGE_SIZE)
  const accepted = withinSize.slice(0, Math.max(0, MAX_IMAGES_PER_PRODUCT - current.length))
  const tooLarge = newFiles.length - withinSize.length

  if (tooLarge > 0) {
    toast.add({ color: 'warning', description: t('images.skipped_too_large', { count: tooLarge }, tooLarge) })
  }

  if (accepted.length < withinSize.length) {
    toast.add({ color: 'warning', description: t('images.limit_reached', { max: MAX_IMAGES_PER_PRODUCT }) })
  }

  entries.value = [
    ...current,
    ...accepted.map((file): ImageEntry => ({ type: 'new', file }))
  ]
}

async function removeEntry (idx: number) {
  const previous = entries.value ?? []
  const entry = previous[idx]

  entries.value = previous.filter((_, i) => i !== idx)

  if (entry?.type === 'saved' && props.productId) {
    try {
      await deleteProductImage(props.orgId, props.productId, entry.id)
    } catch (error) {
      entries.value = previous
      toastApiError(error)
    }
  }
}

function entryKey (entry: ImageEntry) {
  return entry.type === 'new'
    ? `new-${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`
    : `saved-${entry.id}`
}
</script>

<template>
  <div class="w-full">
    <input
      ref="inputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="onChange">
    <div class="flex items-center gap-2">
      <UButton
        icon="i-lucide-image-plus"
        variant="soft"
        :disabled="isFull"
        @click="openPicker">
        {{ $t('images.add') }}
      </UButton>
      <span class="text-xs text-dimmed">{{ entries.length }}/{{ MAX_IMAGES_PER_PRODUCT }}</span>
    </div>
    <div class="w-full flex flex-col border border-accented/40 rounded mt-2 p-1 gap-1">
      <ImageItem
        v-for="(entry, idx) in entries"
        :key="entryKey(entry)"
        :entry="entry"
        @remove="() => removeEntry(idx)"
      />
      <h1
        v-if="entries.length === 0"
        class="w-full p-2 text-center text-dimmed select-none"
      >{{ $t('images.none') }}</h1>
    </div>
  </div>
</template>
