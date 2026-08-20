import { accessCustomer } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])

  const { customer } = await accessCustomer(event, organization.id)

  await customer.destroy()

  return { customer }
})
