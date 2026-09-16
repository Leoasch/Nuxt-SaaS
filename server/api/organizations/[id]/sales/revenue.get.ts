import { Op } from 'sequelize'
import { Sale } from '~~/server/database/models/Sale'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

const ALLOWED_DAYS = [1, 7, 30]
const DEFAULT_DAYS = 30
const HOURS_IN_DAY = 24

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const query = getQuery(event)
  const requestedDays = Number(query.days)
  const days = ALLOWED_DAYS.includes(requestedDays) ? requestedDays : DEFAULT_DAYS

  if (days === 1) {
    return { revenue: await getHourlyRevenue(organization.id) }
  }

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
  const countsByDay = new Map<string, number>()

  for (const sale of sales) {
    const day = sale.createdAt.toISOString().slice(0, 10)
    totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + sale.total)
    countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1)
  }

  const revenue = []

  for (let i = 0; i < days; i++) {
    const date = new Date(cutoff)
    date.setDate(date.getDate() + i)
    const day = date.toISOString().slice(0, 10)

    revenue.push({
      date: date.toISOString(),
      total: Math.round((totalsByDay.get(day) ?? 0) * 100) / 100,
      count: countsByDay.get(day) ?? 0
    })
  }

  return { revenue }
})

async function getHourlyRevenue (organizationId: string) {
  const cutoff = new Date()
  cutoff.setMinutes(0, 0, 0)
  cutoff.setHours(cutoff.getHours() - (HOURS_IN_DAY - 1))

  const sales = await Sale.findAll({
    where: {
      organization_id: organizationId,
      canceled_at: null,
      createdAt: { [Op.gte]: cutoff }
    },
    attributes: ['total', 'createdAt']
  })

  const totalsByHour = new Map<number, number>()
  const countsByHour = new Map<number, number>()

  for (const sale of sales) {
    const hourStart = new Date(sale.createdAt)
    hourStart.setMinutes(0, 0, 0)
    const key = hourStart.getTime()
    totalsByHour.set(key, (totalsByHour.get(key) ?? 0) + sale.total)
    countsByHour.set(key, (countsByHour.get(key) ?? 0) + 1)
  }

  const revenue = []

  for (let i = 0; i < HOURS_IN_DAY; i++) {
    const date = new Date(cutoff.getTime() + i * 60 * 60 * 1000)
    const key = date.getTime()

    revenue.push({
      date: date.toISOString(),
      total: Math.round((totalsByHour.get(key) ?? 0) * 100) / 100,
      count: countsByHour.get(key) ?? 0
    })
  }

  return revenue
}
