import { sequelize } from '~~/server/database'
import { Customer } from '~~/server/database/models/Customer'
import { Product } from '~~/server/database/models/Product'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { StockMovement } from '~~/server/database/models/StockMovements'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization, user } = await organizationAccessValidation(event, ['MANAGER'])

  await sequelize.transaction(async (transaction) => {
    const { sale } = await accessSale(event, organization.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    })

    if (sale.canceled_at) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Sale is already canceled.',
        data: {
          code: 'SALE.ALREADY_CANCELED',
        },
      })
    }

    const items = await SaleItem.findAll({ where: { sale_id: sale.id }, transaction })

    for (const item of items) {
      const product = await Product.findOne({
        where: { id: item.product_id, organization_id: organization.id },
        transaction,
        lock: transaction.LOCK.UPDATE
      })

      if (product) {
        product.stock_quantity += item.quantity
        await product.save({ transaction })
      }

      await StockMovement.create({
        organization_id: organization.id,
        user_id: user.id,
        product_id: item.product_id,
        quantity: item.quantity,
        reason: `Sale ${sale.id} canceled`
      }, { transaction })
    }

    sale.canceled_at = new Date()
    await sale.save({ transaction })
  })

  const { sale: canceledSale } = await accessSale(
    event,
    organization.id,
    {
      include: [
        { model: SaleItem, as: 'sale_items', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] },
        { model: Customer, as: 'customer', attributes: ['id', 'name'] }
      ]
    }
  )

  return { sale: canceledSale }
})
