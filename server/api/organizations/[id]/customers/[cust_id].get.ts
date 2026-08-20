import { accessCustomer, organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { customer } = await accessCustomer(event, organization.id)
  
  return { customer }
})
