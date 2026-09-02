import z from 'zod'
import { Sale } from '~~/server/database/models/Sale'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

const searchQuerySchema = z.object({
})

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { data } = parseQuery(event, searchQuerySchema)

  const sales = await Sale.findAll({
    where: { organization_id: organization.id, ...data },
    include: [{ model: SaleItem, as: 'sale_items' }],
    order: [['createdAt', 'DESC']],
  })

  return { sales }
})
