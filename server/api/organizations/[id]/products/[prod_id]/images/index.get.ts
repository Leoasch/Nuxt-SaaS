import { accessProduct, organizationAccessValidation } from '~~/server/utils/accessValidation'
import { ProductImage } from '~~/server/database/models/ProductImage'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)
  const { product } = await accessProduct(event, organization.id)

  const images = await ProductImage.findAll({
    where: { product_id: product.id },
    attributes: ['id', 'product_id', 'mime_type', 'size', 'createdAt', 'updatedAt'],
    order: [['updatedAt', 'ASC']],
  })

  return { images }
})
