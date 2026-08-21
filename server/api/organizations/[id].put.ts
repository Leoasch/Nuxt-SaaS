import { z } from 'zod'
import { organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'

const editOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  document: z.string().trim().min(1).max(32).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event, ['ADMIN'])

  const result = await parseBody(event, editOrganizationSchema)

  const { name, document } = result.data

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
