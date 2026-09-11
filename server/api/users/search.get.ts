import { Op } from 'sequelize'
import { z } from 'zod'
import { User } from '~~/server/database/models/User'
import { parseQuery } from '~~/server/utils/accessValidation'

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100)
})

function escapeLike (value: string) {
  return value.replace(/[\\%_]/g, char => `\\${char}`)
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const { data } = parseQuery(event, searchQuerySchema)
  const term = `%${escapeLike(data.q)}%`

  const users = await User.findAll({
    attributes: ['id', 'name', 'email'],
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } }
      ]
    },
    order: [['createdAt', 'ASC']],
    limit: 10
  })

  return { users }
})
