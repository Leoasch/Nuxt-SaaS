<script setup lang="ts">
import { deleteProductImage, type ImageEntry } from '~/api/products'

const props = defineProps<{
  orgId: string
  productId?: string
}>()

const entries = defineModel<ImageEntry[]>({ default: () => [] })

const inputRef = ref<HTMLInputElement>()

function openPicker () {
  inputRef.value?.click()
}

function onChange (event: Event) {
  const input = event.target as HTMLInputElement

  addFiles(input.files ? Array.from(input.files) : [])

  input.value = ''
}

function addFiles (newFiles: File[]) {
  entries.value = [
    ...(entries.value ?? []),
    ...newFiles.map((file): ImageEntry => ({ type: 'new', file }))
  ]
}

async function removeEntry (idx: number) {
  const entry = entries.value?.[idx]

  entries.value = (entries.value ?? []).filter((_, i) => i !== idx)

  if (entry?.type === 'saved' && props.productId) {
    await deleteProductImage(props.orgId, props.productId, entry.id)
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
    <UButton
      icon="i-lucide-image-plus"
      variant="soft"
      @click="openPicker">
      {{ $t('images.add') }}
    </UButton>
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
