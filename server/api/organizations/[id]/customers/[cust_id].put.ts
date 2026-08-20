import { z } from 'zod'
import { accessCustomer, organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const editCustomerSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.email().optional(),
  phone: z.string().max(25).optional(),
  document: z.string().max(30).optional(),
})

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])
  const { customer } = await accessCustomer(event, organization.id)

  const result = await parseBody(event, editCustomerSchema)

  if (result.data) {
    Object.assign(customer, result.data)
  }

  await customer.save()
  

  return { customer }
})
