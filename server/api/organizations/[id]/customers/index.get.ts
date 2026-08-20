import { Customer } from '~~/server/database/models/Customer'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const customers = await Customer.findAll({ where: { organization_id: organization.id } })

  return { customers }
})
