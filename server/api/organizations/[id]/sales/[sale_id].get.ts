import { Product } from '~~/server/database/models/Product'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { organizationAccessValidation, } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { sale } = await accessSale(
    event, 
    organization.id, 
    { include: [{ model: SaleItem, as: 'sale_items', include: [ { model: Product, as: 'product', attributes: ['id', 'name'] } ] }] }
  )
  
  return { sale }
})
