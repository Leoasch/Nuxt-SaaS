import { Op } from 'sequelize'
import { sequelize } from '~~/server/database'
import { Product } from '~~/server/database/models/Product'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'
import { NEAR_MINIMUM_MARGIN, stockStatus } from '~~/shared/utils/stock'

const LIMIT = 20

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const stock = sequelize.col('stock_quantity')
  const minimum = sequelize.col('minimum_stock')
  const nearLimit = sequelize.literal(`"minimum_stock" + GREATEST(1, CEIL("minimum_stock" * ${NEAR_MINIMUM_MARGIN}))`)
  const base = { organization_id: organization.id, minimum_stock: { [Op.gt]: 0 } }

  const [products, below, near] = await Promise.all([
    Product.findAll({
      where: { ...base, [Op.and]: [sequelize.where(stock, Op.lte, nearLimit)] },
      attributes: ['id', 'name', 'sku', 'stock_quantity', 'minimum_stock'],
      order: [[sequelize.literal('"stock_quantity"::float / "minimum_stock"'), 'ASC'], ['name', 'ASC']],
      limit: LIMIT
    }),
    Product.count({
      where: { ...base, [Op.and]: [sequelize.where(stock, Op.lte, minimum)] }
    }),
    Product.count({
      where: { ...base, [Op.and]: [sequelize.where(stock, Op.gt, minimum), sequelize.where(stock, Op.lte, nearLimit)] }
    })
  ])

  return {
    products: products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock_quantity: product.stock_quantity,
      minimum_stock: product.minimum_stock,
      status: stockStatus(product)
    })),
    total: below + near,
    counts: { below, near }
  }
})
