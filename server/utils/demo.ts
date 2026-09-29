import type { H3Event } from 'h3'
import { isDemoEmail } from '~~/shared/utils/demo'

export const isDemoMode = () => !!useRuntimeConfig().public.demoEmail

export async function assertNotDemoAccount (event: H3Event) {
  if (!isDemoMode()) {
    return
  }

  const { user } = await getUserSession(event)

  if (isDemoEmail(user?.email)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not available on demo accounts',
      data: {
        code: 'DEMO.ACTION_DISABLED'
      }
    })
  }
}
