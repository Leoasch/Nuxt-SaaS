import { z } from 'zod'
import { accessProduct, organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const editProductSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  sku: z.string().trim().min(2).max(100).optional().nullable(),
  barcode: z.string().trim().min(2).max(100).optional().nullable(),
  cost_price: z.number().optional(),
  sale_price: z.number().optional(),
  stock_quantity: z.number().optional(),
  minimum_stock: z.number().optional(),
})

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])
  const { product } = await accessProduct(event, organization.id)

  const result = await parseBody(event, editProductSchema)

  if (result.data) {
    Object.assign(product, result.data)
  }

  await product.save()
  

  return { product }
})
