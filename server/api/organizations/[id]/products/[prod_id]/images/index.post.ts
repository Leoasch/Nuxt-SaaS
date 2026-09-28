import { col, fn } from 'sequelize'
import { accessProduct, organizationAccessValidation } from '~~/server/utils/accessValidation'
import { Product } from '~~/server/database/models/Product'
import { ProductImage } from '~~/server/database/models/ProductImage'
import { uploadObject } from '~~/server/utils/storage'
import { assertContentLength } from '~~/server/utils/uploads'
import {
  MAX_IMAGE_SIZE,
  MAX_IMAGES_PER_PRODUCT,
  MAX_IMAGES_PER_UPLOAD,
  ORGANIZATION_IMAGE_QUOTA,
  maxUploadBytes
} from '~~/shared/utils/uploads'

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['MANAGER'])
  const { product } = await accessProduct(event, organization.id)

  assertContentLength(event, maxUploadBytes(MAX_IMAGES_PER_UPLOAD), 'PRODUCT_IMAGE.UPLOAD_TOO_LARGE')

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

  if (files.length > MAX_IMAGES_PER_UPLOAD) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Too many images in one upload',
      data: {
        code: 'PRODUCT_IMAGE.TOO_MANY_FILES',
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

    if (file.data.length > MAX_IMAGE_SIZE) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Image too large',
        data: {
          code: 'PRODUCT_IMAGE.TOO_LARGE',
        },
      })
    }
  }

  const [imageCount, usage] = await Promise.all([
    ProductImage.count({ where: { product_id: product.id } }),
    ProductImage.findOne({
      attributes: [[fn('SUM', col('size')), 'usedBytes']],
      include: [{ model: Product, attributes: [], where: { organization_id: organization.id }, paranoid: false }],
      raw: true
    }) as unknown as Promise<{ usedBytes: string | null } | null>
  ])

  if (imageCount + files.length > MAX_IMAGES_PER_PRODUCT) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product image limit reached',
      data: {
        code: 'PRODUCT_IMAGE.PRODUCT_LIMIT',
      },
    })
  }

  const incomingBytes = files.reduce((sum, file) => sum + file.data.length, 0)

  if (Number(usage?.usedBytes ?? 0) + incomingBytes > ORGANIZATION_IMAGE_QUOTA) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Organization image storage quota reached',
      data: {
        code: 'PRODUCT_IMAGE.STORAGE_QUOTA',
      },
    })
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
