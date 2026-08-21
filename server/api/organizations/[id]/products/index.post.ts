import { z } from 'zod'
import { Product } from '~~/server/database/models/Product'
import { organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const createProductSchema = z.object({
  name: z.string().trim().min(2).max(100),
  sku: z.string().trim().min(2).max(100).optional().nullable(),
  barcode: z.string().trim().min(2).max(100).optional().nullable(),
  cost_price: z.number().optional(),
  sale_price: z.number().optional(),
  stock_quantity: z.number().optional(),
  minimum_stock: z.number().optional(),
})

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])

  const result = await parseBody(event, createProductSchema)

  const {
    name,
    barcode,
    sku,
    cost_price,
    minimum_stock,
    sale_price,
    stock_quantity
  } = result.data


  const product = await Product.create({
    organization_id: organization.id,
    name,
    barcode: barcode ?? null,
    sku: sku ?? null,
    cost_price: cost_price ?? 0,
    minimum_stock: minimum_stock ?? 0,
    sale_price: sale_price ?? 0,
    stock_quantity: stock_quantity ?? 0,
  })

  return { product }
})
