import { Customer } from '~~/server/database/models/Customer'
import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const paging = getPagingParams(event)

  const { count, rows: customers } = await Customer.findAndCountAll({
    where: { organization_id: organization.id },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit: paging.limit,
    offset: paging.index
  })

  return { customers, page: makePage(count, paging)  }
})
