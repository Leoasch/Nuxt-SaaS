import { z } from 'zod'
import { sequelize } from '~~/server/database'
import { Customer } from '~~/server/database/models/Customer'
import { Product } from '~~/server/database/models/Product'
import { Sale } from '~~/server/database/models/Sale'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const createSaleSchema = z.object({
  customer_id: z.string().optional().nullable(),
  payment_method: z.string().trim().min(1).max(50),
  products: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0).optional()
  })).min(1)
})

const round2 = (value: number) => Math.round(value * 100) / 100

export default defineEventHandler(async (event) => {
  const { organization, user } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])

  const result = await parseBody(event, createSaleSchema)

  const { customer_id, payment_method, products } = result.data

  if (customer_id) {
    const customer = await Customer.findOne({ where: { id: customer_id, organization_id: organization.id } })

    if (!customer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found.',
        data: {
          code: 'CUSTOMER.NOT_FOUND',
        },
      })
    }
  }

  const sale = await sequelize.transaction(async (transaction) => {
    let total = 0
    const itemsData = []

    for (const line of products) {
      const product = await Product.findOne({
        where: { id: line.product_id, organization_id: organization.id },
        transaction,
        lock: transaction.LOCK.UPDATE
      })

      if (!product) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found.',
          data: {
            code: 'PRODUCT.NOT_FOUND',
            product_id: line.product_id
          },
        })
      }

      // if (product.stock_quantity < line.quantity) {
      //   throw createError({
      //     statusCode: 409,
      //     statusMessage: 'Insufficient stock.',
      //     data: {
      //       code: 'PRODUCT.INSUFFICIENT_STOCK',
      //       product_id: product.id
      //     },
      //   })
      // }

      const original_unit_price = product.sale_price
      const unit_price = line.unit_price ?? original_unit_price
      const itemTotal = round2(unit_price * line.quantity)

      total += itemTotal

      product.stock_quantity -= line.quantity
      await product.save({ transaction })

      itemsData.push({
        product_id: product.id,
        quantity: line.quantity,
        unit_price,
        original_unit_price,
        total: itemTotal
      })
    }

    const sale = await Sale.create({
      organization_id: organization.id,
      user_id: user.id,
      customer_id: customer_id ?? null,
      payment_method,
      total: round2(total)
    }, { transaction })

    await SaleItem.bulkCreate(
      itemsData.map(item => ({ ...item, sale_id: sale.id })),
      { transaction }
    )

    return sale
  })

  const createdSale = await Sale.findOne({
    where: { id: sale.id },
    include: [{ model: SaleItem, as: 'sale_items' }]
  })

  return { sale: createdSale }
})
