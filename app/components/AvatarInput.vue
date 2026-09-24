<script setup lang="ts">
const props = defineProps<{
  text: string
  canEdit?: boolean
  image?: string
}>()

const emit = defineEmits<{ select: [file: File], clear: [] }>()

const inputRef = ref<HTMLInputElement>()

const imageUrl = ref<null | string>(props.image ?? null)

function openPicker () {
  inputRef.value?.click()
}

function onChange (event: Event) {
  const input = event.target as HTMLInputElement

  const file = input.files?.[0]

  if (file) {
    imageUrl.value = URL.createObjectURL(file)
    emit('select', file)
  }

}

function clearAvatar () {
  imageUrl.value = null
  emit('clear')
}

watch(() => props.canEdit, () => {
  imageUrl.value = props.image ?? null
})

</script>

<template>
  <div class="size-20 border-2 border-accented rounded-full relative">
    <NameInitialsImage
      v-if="!imageUrl"
      :name="text"
      class="size-full"
    />
    <img
      v-else
      :src="imageUrl"
      :alt="$t('profile.avatar_alt', { name: text })"
      class="size-full shrink-0 object-cover rounded-full"
    >
    <div 
      v-if="canEdit"
      class="size-full absolute inset-0 m-auto bg-accented/50 rounded-full 
      flex items-center justify-center opacity-0 hover:opacity-80 cursor-pointer"
      role="button"
      :aria-label="$t('profile.upload_avatar')"
      @click="openPicker"
    >
      <UIcon
        name="i-lucide-upload"
        class="size-3/5"
      />
      <input
        ref="inputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onChange"
      >
    </div>
    <div 
      v-if="imageUrl && canEdit"
      class="size-6 border border-error rounded-full bg-error/30 cursor-pointer absolute right-0 bottom-0"
      role="button"
      :aria-label="$t('profile.remove_avatar')"
      @click="clearAvatar"
    >
      <UIcon
        name="lucide:x"
        class="size-full bg-error"
      />
    </div>
  </div>
</template>