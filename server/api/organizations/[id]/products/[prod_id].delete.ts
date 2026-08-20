import { accessProduct } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN', 'MANAGER'])

  const { product } = await accessProduct(event, organization.id)

  await product.destroy()

  return { product }
})
