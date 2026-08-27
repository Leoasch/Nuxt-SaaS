import { Op } from 'sequelize'
import { z } from 'zod'
import { Product } from '~~/server/database/models/Product'
import { ProductImage } from '~~/server/database/models/ProductImage'
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

  const products = await Product.findAll({
    where: {
      organization_id: organization.id,
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { sku: { [Op.iLike]: term } },
        { barcode: { [Op.iLike]: term } }
      ]
    },
    order: [['createdAt', 'ASC']],
    limit: 10,
    include: { model: ProductImage, as: 'images' }
  })

  return { products }
})
