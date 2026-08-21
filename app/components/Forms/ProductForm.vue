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
import type { Product } from '~~/shared/types'

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
  'stock_quantity',
  'minimum_stock'
] as const, 'save')
const { loadProducts } = useProducts()

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
  stock_quantity: props.product?.stock_quantity ?? 0,
  minimum_stock: props.product?.minimum_stock ?? 0
})

const images = ref<ImageEntry[]>([])

if (props.product) {
  const productId = props.product.id

  getProductImages(props.orgId, productId).then((result) => {
    if (result?.images) {
      images.value = result.images.map((image): ImageEntry => ({
        type: 'saved',
        id: image.id,
        url: productImageUrl(props.orgId, productId, image.id),
        mimeType: image.mime_type,
        size: image.size,
      }))
    }
  })
}

async function save () {
  resetErrors()
  loading.value = true
  try {
    const body = nullifyEmpty(form.value)

    const result = body.id
      ? await editProduct(props.orgId, body)
      : await postProduct(props.orgId, body)

    const newFiles = images.value
      .filter(entry => entry.type === 'new')
      .map(entry => entry.file)

    if (newFiles.length > 0) {
      await uploadProductImages(props.orgId, result.product.id, newFiles)
    }

    await loadProducts()
    emit('close')
  } catch (error: any) {

    handleError(error)
    if (errors.save) {
      useToast().add({
        description: `${ $t('save.error') }: ${$t(errors.save)}`,
        color: 'error'
      })
    }

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
    }">
    <template #body>
      <div class="flex flex-col gap-6">
        <UFormField
          :label="$t('product.name')"
          :error="errors.name">
          <UInput
            v-model="form.name"
            :placeholder="$t('product.name')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('product.sku')"
          :error="errors.sku">
          <UInput
            v-model="form.sku!"
            :placeholder="$t('product.sku')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('product.barcode')"
          :error="errors.barcode">
          <UInput
            v-model="form.barcode!"
            :placeholder="$t('product.barcode')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('product.cost_price')"
          :error="errors.cost_price">
          <UInput
            v-model="form.cost_price"
            type="number"
            :placeholder="$t('product.cost_price')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('product.sale_price')"
          :error="errors.sale_price">
          <UInput
            v-model="form.sale_price"
            type="number"
            :placeholder="$t('product.sale_price')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('product.stock_quantity')"
          :error="errors.stock_quantity">
          <UInput
            v-model="form.stock_quantity"
            type="number"
            :placeholder="$t('product.stock_quantity')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('product.minimum_stock')"
          :error="errors.minimum_stock">
          <UInput
            v-model="form.minimum_stock"
            type="number"
            :placeholder="$t('product.minimum_stock')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <ImagesInput
          v-model="images"
          :org-id="orgId"
          :product-id="product?.id"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton @click="save">
          {{ $t(`product.save.${type}`) }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>