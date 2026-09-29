import { z } from 'zod'
import { sequelize } from '~~/server/database'
import { StockMovement } from '~~/server/database/models/StockMovements'
import { organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const createStockMovementSchema = z.object({
  quantity: z.number().int().refine(quantity => quantity !== 0, 'not_zero'),
  reason: z.string().nullable(),
})

export default defineEventHandler(async (event) => {
  const { organization, user } = await organizationAccessValidation(event, ['MANAGER'])

  const result = await parseBody(event, createStockMovementSchema)

  const {
    quantity,
    reason
  } = result.data

  const query = getQuery(event)
  const productId = query.product_id as string

  if (!productId) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'PRODUCT_ID_MISSING',
      },
    })
  }

  const { product } = await accessProduct(event, organization.id, productId)

  const stockMovement = await sequelize.transaction(async (transaction) => {
    await product.increment('stock_quantity', { by: quantity, transaction })

    return await StockMovement.create({
      organization_id: organization.id,
      quantity,
      reason,
      product_id: product.id,
      user_id: user.id
    }, { transaction })
  })

  return { stockMovement }
})
