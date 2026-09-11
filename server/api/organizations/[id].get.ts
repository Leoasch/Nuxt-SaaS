import { organizationAccessValidation } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { membership, organization } = await organizationAccessValidation(event, [], { allowPending: true })

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      document: organization.document,
      role: membership.role,
      is_member: !membership.pending_invite
    }
  }
})
