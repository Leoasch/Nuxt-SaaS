import { accessProduct, organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)

  const { product } = await accessProduct(event, organization.id)
  
  return { product }
})
