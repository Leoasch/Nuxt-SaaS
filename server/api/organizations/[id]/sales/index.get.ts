import { Customer } from '~~/server/database/models/Customer'
import { Sale } from '~~/server/database/models/Sale'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'
import { getPagingParams, makePage } from '~~/server/utils/paging'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const paging = getPagingParams(event)
  
  const { count, rows: sales } = await Sale.findAndCountAll({
    where: { organization_id: organization.id },
    include: [
      { model: SaleItem, as: 'sale_items' },
      { model: Customer, as: 'customer', attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: paging.limit,
    offset: paging.index,
    distinct: true
  })

  return { sales, page: makePage(count, paging) }
})
