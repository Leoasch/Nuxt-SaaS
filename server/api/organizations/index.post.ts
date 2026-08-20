import { sequelize } from '~~/server/database'
import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { z } from 'zod'
import { parseBody } from '~~/server/utils/accessValidation'

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  document: z.string().trim().min(1).max(32).optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const result = await parseBody(event, createOrganizationSchema)

  const { name, document } = result.data

  const organization = await sequelize.transaction(async (transaction) => {
    const organization = await Organization.create(
      { name, document: document ?? null },
      { transaction }
    )

    await OrganizationMember.create(
      {
        organization_id: organization.id,
        user_id: user.id,
        role: 'ADMIN'
      },
      { transaction }
    )

    return organization
  })

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      document: organization.document,
      role: 'ADMIN'
    }
  }
})
