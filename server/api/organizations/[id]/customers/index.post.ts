import { z } from 'zod'
import { Customer } from '~~/server/database/models/Customer'
import { organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const createCustomerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().optional().nullable(),
  phone: z.string().max(25).optional().nullable(),
  document: z.string().max(30).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])
  
  const result = await parseBody(event, createCustomerSchema)

  const {
    name,
    document,
    email,
    phone
  } = result.data

  const customer = await Customer.create({
    organization_id: organization.id,
    name,
    document,
    email,
    phone
  })

  return { customer }
})
