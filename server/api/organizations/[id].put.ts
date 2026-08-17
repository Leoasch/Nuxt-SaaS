import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { z } from 'zod'

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  document: z.string().trim().min(1).max(32).optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody(event)

  const organization_id = getRouterParam(event, 'id')

  if (!organization_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

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

  const organization = await Organization.findOne({ where: { id: organization_id } })

  if (!organization) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Organization not found',
      data: {
        code: 'ORGANIZATION.NOT_FOUND',
      },
    })
  }

  const membership = await OrganizationMember.findOne({
    where: {
      user_id: user.id,
      organization_id: organization.id
    }
  })

  if (!membership) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Organization not found',
      data: {
        code: 'ORGANIZATION.NOT_FOUND',
      },
    })
  }

  if (membership?.role !== 'ADMIN') {
    // NOT ALLOWED ERROR
    throw createError({
      statusCode: 405,
      statusMessage: 'User does not have permission to edit organization.',
      data: {
        code: 'ORGANIZATION.NOT_ALLOWED',
      },
    })
  }

  organization.document = document ?? null
  organization.name = name

  await organization.save()

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      document: organization.document,
      role: 'ADMIN'
    }
  }
})
