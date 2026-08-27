import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { stockMovement } = await accessStockMv(event, organization.id)
  
  return { stockMovement }
})
