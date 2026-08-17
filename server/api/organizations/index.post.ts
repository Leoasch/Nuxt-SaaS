import { sequelize } from '~~/server/database'
import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { z } from 'zod'

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  document: z.string().trim().min(1).max(32).optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody(event)

  const result = createOrganizationSchema.safeParse(body)

  if (!result.success) {
    const fields: Record<string, string> = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !fields[field]) {
        fields[field] = issue.code
      }
    }

    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: {
        code: 'VALIDATION_ERROR',
        fields,
      },
    })
  }

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
