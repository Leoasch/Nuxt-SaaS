import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { User } from '~~/server/database/models/User'
import { isDemoMode } from '~~/server/utils/demo'
import { isDemoEmail } from '~~/shared/utils/demo'

export default defineEventHandler(async (event) => {
  if (!isDemoMode()) {
    throw createError({ statusCode: 404 })
  }

  const email = useRuntimeConfig().public.demoEmail
  const user = isDemoEmail(email) ? await User.findOne({ where: { email } }) : null

  if (!user) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Demo account unavailable',
      data: {
        code: 'DEMO.UNAVAILABLE'
      }
    })
  }

  await startUserSession(event, user)

  const ownership = await OrganizationMember.findOne({
    where: { user_id: user.id, role: 'OWNER' },
    attributes: ['organization_id']
  })

  return {
    success: true,
    organizationId: ownership?.organization_id ?? null
  }
})
