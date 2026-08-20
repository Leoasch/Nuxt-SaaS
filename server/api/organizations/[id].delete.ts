import { sequelize } from '~~/server/database'
import { Customer } from '~~/server/database/models/Customer'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { Product } from '~~/server/database/models/Product'
import { Sale } from '~~/server/database/models/Sale'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { StockMovement } from '~~/server/database/models/StockMovements'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN'])

  await sequelize.transaction(async (transaction) => {
    const sales = await Sale.findAll({
      where: { organization_id: organization.id },
      attributes: ['id'],
      transaction
    })

    await SaleItem.destroy({ where: { sale_id: sales.map(sale => sale.id) }, transaction })
    await StockMovement.destroy({ where: { organization_id: organization.id }, transaction })
    await Sale.destroy({ where: { organization_id: organization.id }, transaction })
    await Product.destroy({ where: { organization_id: organization.id }, transaction })
    await Customer.destroy({ where: { organization_id: organization.id }, transaction })
    await OrganizationMember.destroy({ where: { organization_id: organization.id }, transaction })
    await organization.destroy({ transaction })
  })

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      document: organization.document,
      role: 'ADMIN'
    }
  }
})
