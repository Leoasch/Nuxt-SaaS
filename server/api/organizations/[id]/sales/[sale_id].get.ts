import { organizationAccessValidation, } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { sale } = await accessSale(event, organization.id)
  
  return { sale }
})
