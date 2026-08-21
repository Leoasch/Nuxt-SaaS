import { accessProduct } from '~~/server/utils/accessValidation'
import { ProductImage } from '~~/server/database/models/ProductImage'
import { deleteObject } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])

  const { product } = await accessProduct(event, organization.id)

  const images = await ProductImage.findAll({ where: { product_id: product.id } })

  await Promise.all(images.map(image => deleteObject(image.key)))
  await ProductImage.destroy({ where: { product_id: product.id } })

  await product.destroy()

  return { product }
})
