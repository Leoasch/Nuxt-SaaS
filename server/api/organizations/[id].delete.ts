import { sequelize } from '~~/server/database'
import { Customer } from '~~/server/database/models/Customer'
import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { Product } from '~~/server/database/models/Product'
import { Sale } from '~~/server/database/models/Sale'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { StockMovement } from '~~/server/database/models/StockMovements'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const organization_id = getRouterParam(event, 'id')

  if (!organization_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  const organization = await Organization.findOne({ where: { id: organization_id } })

  if (!organization) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Organization not found',
      data: {
        code: 'ORGANIZATION.NOT_FOUND',
      },
    })
  }

  const membership = await OrganizationMember.findOne({
    where: {
      user_id: user.id,
      organization_id: organization.id
    }
  })

  if (!membership) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Organization not found',
      data: {
        code: 'ORGANIZATION.NOT_FOUND',
      },
    })
  }

  if (membership?.role !== 'ADMIN') {
    // NOT ALLOWED ERROR
    throw createError({
      statusCode: 405,
      statusMessage: 'User does not have permission to edit organization.',
      data: {
        code: 'ORGANIZATION.NOT_ALLOWED',
      },
    })
  }

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
