import { accessProduct, organizationAccessValidation } from '~~/server/utils/accessValidation'
import { ProductImage } from '~~/server/database/models/ProductImage'
import { uploadObject } from '~~/server/utils/storage'

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])
  const { product } = await accessProduct(event, organization.id)

  const parts = await readMultipartFormData(event)
  const files = (parts ?? []).filter(part => part.name === 'images' && part.filename)

  if (files.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No images sent',
      data: {
        code: 'PRODUCT_IMAGE.EMPTY',
      },
    })
  }

  for (const file of files) {
    if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unsupported image type',
        data: {
          code: 'PRODUCT_IMAGE.INVALID_TYPE',
        },
      })
    }

    if (file.data.length > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Image too large',
        data: {
          code: 'PRODUCT_IMAGE.TOO_LARGE',
        },
      })
    }
  }

  const pending = files.map((file) => {
    const id = crypto.randomUUID()

    return {
      id,
      key: `products/${product.id}/${id}`,
      mime_type: file.type!,
      size: file.data.length,
      data: file.data,
    }
  })

  await Promise.all(pending.map(item => uploadObject(item.key, item.data, item.mime_type)))

  const created = await ProductImage.bulkCreate(
    pending.map(({ data, ...item }) => ({
      product_id: product.id,
      ...item,
    }))
  )

  return {
    images: created.map(image => ({
      id: image.id,
      product_id: image.product_id,
      mime_type: image.mime_type,
      size: image.size,
    }))
  }
})
