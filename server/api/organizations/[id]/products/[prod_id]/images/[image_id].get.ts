import { accessProduct, accessProductImage, organizationAccessValidation } from '~~/server/utils/accessValidation'
import { getObject } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)
  const { product } = await accessProduct(event, organization.id)
  const { image } = await accessProductImage(event, product.id)

  setResponseHeader(event, 'Content-Type', image.mime_type)
  setResponseHeader(event, 'Cache-Control', 'private, max-age=31536000, immutable')
  setResponseHeader(event, 'Content-Length', image.size)

  return await getObject(image.key)
})
