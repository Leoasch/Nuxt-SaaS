import { Product } from '~~/server/database/models/Product'
import { ProductImage } from '~~/server/database/models/ProductImage'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const products = await Product.findAll({
    where: { organization_id: organization.id },
    order: [['createdAt', 'ASC']],
    include: { model: ProductImage, as: 'images', attributes: ['id'] }
  })


  return { products }
})
