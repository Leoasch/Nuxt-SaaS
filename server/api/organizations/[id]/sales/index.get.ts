import { Op, col, fn, literal, type WhereOperators } from 'sequelize'
import z from 'zod'
import { sequelize } from '~~/server/database'
import { Customer } from '~~/server/database/models/Customer'
import { Sale } from '~~/server/database/models/Sale'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'
import { getPagingParams, makePage } from '~~/server/utils/paging'

const salesFilterSchema = z.object({
  product_id: z.string().min(1).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional()
})

const round2 = (value: number) => Math.round(value * 100) / 100

type SummaryRow = {
  count: string | null
  quantity?: string | null
  total: string | null
}

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { data: filters } = parseQuery(event, salesFilterSchema)
  const paging = getPagingParams(event)

  const productId = filters.product_id

  const createdAt: WhereOperators<Date> = {}
  if (filters.from) {
    createdAt[Op.gte] = new Date(filters.from)
  }
  if (filters.to) {
    createdAt[Op.lt] = new Date(filters.to)
  }

  const saleWhere = {
    organization_id: organization.id,
    ...(filters.from || filters.to ? { createdAt } : {})
  }

  const summaryQuery = (productId
    ? SaleItem.findOne({
      attributes: [
        [fn('COUNT', fn('DISTINCT', col('SaleItem.sale_id'))), 'count'],
        [fn('SUM', col('SaleItem.quantity')), 'quantity'],
        [fn('SUM', col('SaleItem.total')), 'total']
      ],
      where: { product_id: productId },
      include: [{ model: Sale, attributes: [], where: { ...saleWhere, canceled_at: null } }],
      raw: true
    })
    : Sale.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total')), 'total']
      ],
      where: { ...saleWhere, canceled_at: null },
      raw: true
    })) as unknown as Promise<SummaryRow | null>

  const [{ count, rows: sales }, summaryRow] = await Promise.all([
    Sale.findAndCountAll({
      where: {
        ...saleWhere,
        ...(productId ? { id: { [Op.in]: literal(`(SELECT sale_id FROM sales_items WHERE product_id = ${sequelize.escape(productId)})`) } } : {})
      },
      include: [
        { model: SaleItem, as: 'sale_items' },
        { model: Customer, as: 'customer', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: paging.limit,
      offset: paging.index,
      distinct: true
    }),
    summaryQuery
  ])

  const summary = {
    count: Number(summaryRow?.count ?? 0),
    quantity: productId ? Number(summaryRow?.quantity ?? 0) : null,
    total: round2(Number(summaryRow?.total ?? 0))
  }

  return { sales, page: makePage(count, paging), summary }
})
