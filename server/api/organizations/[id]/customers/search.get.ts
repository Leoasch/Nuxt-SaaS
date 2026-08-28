import { Op } from 'sequelize'
import { z } from 'zod'
import { Customer } from '~~/server/database/models/Customer'
import { organizationAccessValidation, parseQuery } from '~~/server/utils/accessValidation'

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100)
})

function escapeLike (value: string) {
  return value.replace(/[\\%_]/g, char => `\\${char}`)
}

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { data } = parseQuery(event, searchQuerySchema)
  const term = `%${escapeLike(data.q)}%`

  const customers = await Customer.findAll({
    where: {
      organization_id: organization.id,
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } },
        { document: { [Op.iLike]: term } }
      ]
    },
    order: [['createdAt', 'ASC']],
    limit: 10
  })

  return { customers }
})
