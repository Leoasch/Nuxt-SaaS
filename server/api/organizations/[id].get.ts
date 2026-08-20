import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { membership, organization } = await organizationAccessValidation(event)

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      document: organization.document,
      role: membership.role
    }
  }
})
