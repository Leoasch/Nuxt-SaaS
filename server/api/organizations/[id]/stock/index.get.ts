import { col } from 'sequelize'
import z from 'zod'
import { Product } from '~~/server/database/models/Product'
import { StockMovement } from '~~/server/database/models/StockMovements'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

const searchQuerySchema = z.object({
  product_id: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { data } = parseQuery(event, searchQuerySchema)

  const stockMovements = await StockMovement.findAll({
    where: { organization_id: organization.id, ...data },
    attributes: {
      include: [[col('Product.name'), 'product_name']]
    },
    include: [{ model: Product, attributes: [] }],
    order: [['createdAt', 'DESC']],
  })

  return { stockMovements }
})
