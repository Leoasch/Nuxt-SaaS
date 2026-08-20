import { Product } from '~~/server/database/models/Product'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const products = await Product.findAll({ where: { organization_id: organization.id } })

  return { products }
})
