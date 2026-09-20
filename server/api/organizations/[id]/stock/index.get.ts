import { col } from 'sequelize'
import z from 'zod'
import { Product } from '~~/server/database/models/Product'
import { StockMovement } from '~~/server/database/models/StockMovements'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'
import { getPagingParams, makePage } from '~~/server/utils/paging'

const searchQuerySchema = z.object({
  product_id: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { data } = parseQuery(event, searchQuerySchema)
  const paging = getPagingParams(event)

  const { count, rows: stockMovements } = await StockMovement.findAndCountAll({
    where: { organization_id: organization.id, ...data },
    attributes: {
      include: [[col('Product.name'), 'product_name']]
    },
    include: [{ model: Product, attributes: [] }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit: paging.limit,
    offset: paging.index
  })

  return { stockMovements, page: makePage(count, paging) }
})
