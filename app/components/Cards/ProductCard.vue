<script setup lang="ts">
import { deleteProduct, getProductImages, getProducts } from '~/api/products'
import { priceFormatter } from '~/common'
import type { Product, ProductImage } from '~~/shared/types'
import ProductForm from '../Forms/ProductForm.vue'
import ConfirmDeleteDialog from '../ConfirmDeleteDialog.vue'

const props = defineProps<{
  productId: string
}>()

const product = ref<Product | null>(null)
const images = ref<ProductImage[]>([])
const loading = ref(false)
const { selectedOrganizationId } = useOrganization()
const { loadProducts } = useProducts()
const overlay = useOverlay()
const emits = defineEmits(['close'])

async function onLoad () {
  try {
    loading.value = true
    if (selectedOrganizationId.value) {
      const [productResult, imagesResult] = await Promise.all([
        getProducts(selectedOrganizationId.value, props.productId),
        getProductImages(selectedOrganizationId.value, props.productId)
      ])
      if (productResult.product) {
        product.value = productResult.product
      }
      if (imagesResult.images) {
        images.value = imagesResult.images
      }
    }
  } finally {
    loading.value = false
  }
}

async function onEdit () {
  if (product.value) {
    const dialog = overlay.create(
      ProductForm,
      { props: {
        orgId: product.value.organization_id,
        product: product.value
      } }
    ).open()
    if (await dialog.result) {
      await onLoad()
    }
  }
}

async function onDelete () {
  const dialog = overlay.create(ConfirmDeleteDialog, {
    props: {
      title: $t('product.confirm_delete.title'),
      description: $t('product.confirm_delete.description'),
    }
  }).open()
  if (await dialog.result) {
    if (product.value) {
      const result = await deleteProduct(product.value.organization_id, product.value.id)
      if (result.product) {
        useToast().add({
          description: $t('product.delete_success'),
          color: 'success'
        })
        await loadProducts()
        emits('close')
      }
    }
  }
}

const isLowStock = computed(() => !!product.value && product.value.stock_quantity <= product.value.minimum_stock)
const formattedSalePrice = computed(() => product.value ? priceFormatter.format(product.value.sale_price) : '')
const formattedCostPrice = computed(() => product.value ? priceFormatter.format(product.value.cost_price) : '')
</script>

<template>
  <CardsBase
    :loading
    @load="onLoad"
    @edit="onEdit"
    @delete="onDelete"
  >
    <div
      v-if="product"
      class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <ImageCarousel
          :images="images"
          :product-id="product.id"
          :org-id="product.organization_id"
          class="size-24 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-lg font-bold">{{ product.name }}</h1>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <span class="text-xl font-bold">{{ formattedSalePrice }}</span>
            <UBadge
              :color="isLowStock ? 'error' : 'neutral'"
              variant="subtle"
              icon="lucide:package">
              {{ product.stock_quantity }}
            </UBadge>
          </div>
        </div>
      </div>

      <div
        v-if="product.sku || product.barcode"
        class="flex flex-col divide-y divide-accented rounded border border-accented bg-accented/20 dark:bg-accented/30">
        <div
          v-if="product.sku"
          class="flex items-center gap-2 p-2">
          <UIcon
            name="lucide:hash"
            class="size-4 shrink-0 text-dimmed"/>
          <span class="truncate">{{ $t('product.sku') }}: {{ product.sku }}</span>
        </div>
        <div
          v-if="product.barcode"
          class="flex items-center gap-2 p-2">
          <UIcon
            name="lucide:barcode"
            class="size-4 shrink-0 text-dimmed"/>
          <span class="truncate">{{ $t('product.barcode') }}: {{ product.barcode }}</span>
        </div>
      </div>

      <div class="flex flex-col divide-y divide-accented rounded border border-accented bg-accented/20 dark:bg-accented/30">
        <div class="flex items-center justify-between p-2">
          <span class="text-dimmed">{{ $t('product.cost_price') }}</span>
          <span class="font-semibold">{{ formattedCostPrice }}</span>
        </div>
        <div class="flex items-center justify-between p-2">
          <span class="text-dimmed">{{ $t('product.sale_price') }}</span>
          <span class="font-semibold">{{ formattedSalePrice }}</span>
        </div>
        <div class="flex items-center justify-between p-2">
          <span class="text-dimmed">{{ $t('product.minimum_stock') }}</span>
          <span class="font-semibold">{{ product.minimum_stock }}</span>
        </div>
      </div>
    </div>
  </CardsBase>
</template>
