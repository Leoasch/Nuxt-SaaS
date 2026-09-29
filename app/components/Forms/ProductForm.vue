<script setup lang="ts">
import {
  editProduct,
  getProductImages,
  postProduct,
  productImageUrl,
  uploadProductImages,
  type ImageEntry,
  type ProductBody
} from '~/api/products'
import type { Product, ProductImage } from '~~/shared/types'
import { MAX_IMAGES_PER_UPLOAD } from '~~/shared/utils/uploads'

const props = defineProps<{
  product?: Product,
  orgId: string
}>()

const { errors, resetErrors, handleError } = useFormErrors([
  'name',
  'sku',
  'barcode',
  'cost_price',
  'sale_price',
  'minimum_stock'
] as const, 'save')
const { toastApiError } = useApiError()
const { loadProducts } = useProducts()

const iconInputUi = { base: 'py-2 ps-10 pe-4', leading: 'ps-3' }

const type = computed(() => props.product ? 'edit' : 'create')
const loading = ref(false)
const emit = defineEmits(['close'])

const form = ref<ProductBody>({
  id: props.product?.id,
  name: props.product?.name ?? '',
  sku: props.product?.sku ?? '',
  barcode: props.product?.barcode ?? '',
  cost_price: props.product?.cost_price ?? 0,
  sale_price: props.product?.sale_price ?? 0,
  minimum_stock: props.product?.minimum_stock ?? 0
})

const images = ref<ImageEntry[]>([])

function savedEntry (productId: string, image: ProductImage): ImageEntry {
  return {
    type: 'saved',
    id: image.id,
    url: productImageUrl(props.orgId, productId, image.id),
    mimeType: image.mime_type,
    size: image.size,
  }
}

if (props.product) {
  const productId = props.product.id

  getProductImages(props.orgId, productId).then((result) => {
    if (result?.images) {
      images.value = result.images.map(image => savedEntry(productId, image))
    }
  })
}

async function uploadNewImages (productId: string) {
  const pending = images.value.filter((entry): entry is Extract<ImageEntry, { type: 'new' }> => entry.type === 'new')

  for (let start = 0; start < pending.length; start += MAX_IMAGES_PER_UPLOAD) {
    const batch = pending.slice(start, start + MAX_IMAGES_PER_UPLOAD)
    const result = await uploadProductImages(props.orgId, productId, batch.map(entry => entry.file))

    images.value = images.value.map((entry) => {
      const uploaded = result.images[batch.findIndex(item => item === entry)]
      return uploaded ? savedEntry(productId, uploaded) : entry
    })
  }
}

async function save () {
  resetErrors()
  loading.value = true
  try {
    const body = nullifyEmpty(form.value)

    const result = body.id
      ? await editProduct(props.orgId, body)
      : await postProduct(props.orgId, body)

    form.value.id = result.product.id
    await uploadNewImages(result.product.id)

    await loadProducts()
    emit('close', true)
  } catch (error: any) {
    handleError(error)
    toastApiError(error, $t('common.save_failed'))
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <UModal
    :title="$t(`product.title.${type}`)"
    :ui="{
      content: 'max-w-3xl'
    }"
    :dismissible="false"
  >
    <template #body>
      <div class="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <UFormField
          :label="$t('product.name')"
          :error="errors.name"
          class="col-span-2 sm:col-span-6">
          <UInput
            v-model="form.name"
            icon="lucide:package"
            :placeholder="$t('product.name')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
        <UFormField
          :label="$t('product.sku')"
          :error="errors.sku"
          class="col-span-2 sm:col-span-3">
          <UInput
            v-model="form.sku!"
            icon="lucide:hash"
            :placeholder="$t('product.sku')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
        <UFormField
          :label="$t('product.barcode')"
          :error="errors.barcode"
          class="col-span-2 sm:col-span-3">
          <UInput
            v-model="form.barcode!"
            icon="lucide:barcode"
            :placeholder="$t('product.barcode')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
        <UFormField
          :label="$t('product.cost_price')"
          :error="errors.cost_price"
          class="sm:col-span-2">
          <PriceInput
            v-model="form.cost_price"
            icon="lucide:wallet"
            :placeholder="$t('product.cost_price')"
          />
        </UFormField>
        <UFormField
          :label="$t('product.sale_price')"
          :error="errors.sale_price"
          class="sm:col-span-2">
          <PriceInput
            v-model="form.sale_price"
            icon="lucide:tag"
            :placeholder="$t('product.sale_price')"
          />
        </UFormField>
        <UFormField
          :label="$t('product.minimum_stock')"
          :error="errors.minimum_stock"
          class="col-span-2 sm:col-span-2">
          <QuantityInput
            v-model="form.minimum_stock"
            icon="lucide:triangle-alert"
            :placeholder="$t('product.minimum_stock')"
          />
        </UFormField>
        <ImagesInput
          v-model="images"
          :org-id="orgId"
          :product-id="form.id"
          class="col-span-2 sm:col-span-6"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          :loading
          @click="save">
          {{ $t(`product.save.${type}`) }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>