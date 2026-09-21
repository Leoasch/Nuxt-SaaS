import { Op } from 'sequelize'
import { z } from 'zod'
import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { parseQuery } from '~~/server/utils/accessValidation'

const searchQuerySchema = z.object({
  q: z.string().trim().max(100).default('')
})

function escapeLike (value: string) {
  return value.replace(/[\\%_]/g, char => `\\${char}`)
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const { data } = parseQuery(event, searchQuerySchema)

  const memberships = await OrganizationMember.findAll({
    where: { user_id: user.id, accepted_at: { [Op.ne]: null } }
  })

  if (memberships.length === 0) {
    return { organizations: [] }
  }

  const roleByOrganizationId = new Map(
    memberships.map(membership => [membership.organization_id, membership.role])
  )

  const organizations = await Organization.findAll({
    where: {
      id: [...roleByOrganizationId.keys()],
      ...(data.q && { name: { [Op.iLike]: `%${escapeLike(data.q)}%` } })
    },
    order: [['name', 'ASC']],
    limit: 10
  })

  return {
    organizations: organizations.map(organization => ({
      id: organization.id,
      name: organization.name,
      document: organization.document,
      role: roleByOrganizationId.get(organization.id)!,
      is_member: true
    }))
  }
})
