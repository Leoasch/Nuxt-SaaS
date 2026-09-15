import { Op } from 'sequelize'
import { Sale } from '~~/server/database/models/Sale'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

const ALLOWED_DAYS = [1, 7, 30]
const DEFAULT_DAYS = 30

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const query = getQuery(event)
  const requestedDays = Number(query.days)
  const days = ALLOWED_DAYS.includes(requestedDays) ? requestedDays : DEFAULT_DAYS

  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (days - 1))

  const sales = await Sale.findAll({
    where: {
      organization_id: organization.id,
      canceled_at: null,
      createdAt: { [Op.gte]: cutoff }
    },
    attributes: ['total', 'createdAt']
  })

  const totalsByDay = new Map<string, number>()

  for (const sale of sales) {
    const day = sale.createdAt.toISOString().slice(0, 10)
    totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + sale.total)
  }

  const revenue = []

  for (let i = 0; i < days; i++) {
    const date = new Date(cutoff)
    date.setDate(date.getDate() + i)
    const day = date.toISOString().slice(0, 10)

    revenue.push({
      date: day,
      total: Math.round((totalsByDay.get(day) ?? 0) * 100) / 100
    })
  }

  return { revenue }
})
