import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const invites = await OrganizationMember.findAll({
    where: {
      user_id: user.id,
      accepted_at: null,
    },
    include: { model: Organization,
      as: 'organization',
      attributes: ['id', 'name', 'document']
    }
  })

  return { invites }
})
