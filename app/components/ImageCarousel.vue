<script setup lang="ts">
import type { ProductImage } from '~~/shared/types'

const AUTOPLAY_INTERVAL = 6000

const props = defineProps<{
  images: ProductImage[],
  orgId: string,
  productId: string
}>()

const currentIndex = ref(0)

const currentImage = computed(() => props.images[currentIndex.value])

function getImageSrc (image_id: string) {
  return `api/organizations/${props.orgId}/products/${props.productId}/images/${image_id}`
}

let timer: ReturnType<typeof setInterval> | undefined

function startTimer () {
  if (props.images.length > 1) {
    timer = setInterval(() => {
      currentIndex.value = currentIndex.value === props.images.length - 1 ? 0 : currentIndex.value + 1
    }, AUTOPLAY_INTERVAL)
  }
}

onMounted(startTimer)
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="relative overflow-hidden rounded-lg bg-elevated">
    <template v-if="currentImage">
      <Transition name="fade">
        <img
          :key="currentImage.id"
          :src="getImageSrc(currentImage.id)"
          :alt="`${productId} image ${currentIndex + 1}`"
          class="absolute inset-0 h-full w-full object-cover"
        >
      </Transition>
    </template>

    <div
      v-else
      class="flex h-full w-full items-center justify-center text-dimmed">
      <UIcon
        name="lucide:image-off"
        class="size-8"/>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
