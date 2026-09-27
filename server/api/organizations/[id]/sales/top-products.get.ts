import { QueryTypes } from 'sequelize'
import { sequelize } from '~~/server/database'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'
import { getSalesPeriodDays, salesPeriodStart } from '~~/server/utils/salesPeriod'

const TOP_BY_QUANTITY = 8
const TOP_BY_PROFIT = 5

const round2 = (value: number) => Math.round(value * 100) / 100

type ProductTotalsRow = {
  id: string
  name: string
  quantity: number
  revenue: string
  profit: string
}

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const since = salesPeriodStart(getSalesPeriodDays(event))

  const rows = await sequelize.query<ProductTotalsRow>(`
    SELECT si.product_id AS id,
           p.name,
           SUM(si.quantity)::int AS quantity,
           SUM(si.total) AS revenue,
           SUM(si.quantity * (si.unit_price - COALESCE(si.unit_cost, p.cost_price))) AS profit
    FROM sales_items si
    JOIN sales s ON s.id = si.sale_id
    JOIN products p ON p.id = si.product_id
    WHERE s.organization_id = :organizationId
      AND s.canceled_at IS NULL
      AND s."createdAt" >= :since
    GROUP BY si.product_id, p.name
  `, {
    type: QueryTypes.SELECT,
    replacements: { organizationId: organization.id, since }
  })

  const products = rows.map(row => ({
    id: row.id,
    name: row.name,
    quantity: Number(row.quantity),
    revenue: round2(Number(row.revenue)),
    profit: round2(Number(row.profit))
  }))

  const byQuantity = [...products]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, TOP_BY_QUANTITY)
    .map(({ id, name, quantity, revenue }) => ({ id, name, quantity, revenue }))

  const profitable = products
    .filter(product => product.profit > 0)
    .sort((a, b) => b.profit - a.profit)

  const sumProfit = (list: typeof profitable) => round2(list.reduce((sum, product) => sum + product.profit, 0))

  return {
    byQuantity,
    byProfit: {
      items: profitable.slice(0, TOP_BY_PROFIT).map(({ id, name, profit }) => ({ id, name, profit })),
      others: sumProfit(profitable.slice(TOP_BY_PROFIT)),
      total: sumProfit(profitable),
      lossCount: products.filter(product => product.profit < 0).length
    }
  }
})
