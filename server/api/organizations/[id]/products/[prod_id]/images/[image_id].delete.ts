import { accessProduct, accessProductImage, organizationAccessValidation } from '~~/server/utils/accessValidation'
import { deleteObject } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])
  const { product } = await accessProduct(event, organization.id)
  const { image } = await accessProductImage(event, product.id)

  await deleteObject(image.key)
  await image.destroy()

  return { image: { id: image.id, product_id: image.product_id } }
})
