import { Op } from 'sequelize'
import { Sale } from '~~/server/database/models/Sale'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

const DAYS = 30

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (DAYS - 1))

  const sales = await Sale.findAll({
    where: {
      organization_id: organization.id,
      canceled_at: null,
      createdAt: { [Op.gte]: cutoff }
    },
    attributes: ['total', 'customer_id']
  })

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const salesCount = sales.length
  const avgOrderValue = salesCount ? totalRevenue / salesCount : 0
  const activeCustomers = new Set(sales.map(sale => sale.customer_id).filter(Boolean)).size

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    salesCount,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    activeCustomers
  }
})
