import { StockMovement } from '~~/server/database/models/StockMovements'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const stockMovements = await StockMovement.findAll({ where: { organization_id: organization.id } })

  return { stockMovements }
})
