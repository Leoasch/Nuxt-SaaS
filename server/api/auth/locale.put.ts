import { User } from '~~/server/database/models/User'
import { z } from 'zod'
import { parseBody } from '~~/server/utils/accessValidation'

const localeSchema = z.object({
  locale: z.enum(LOCALES)
})

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)

  const result = await parseBody(event, localeSchema)

  await User.update({ locale: result.data.locale }, { where: { id: sessionUser.id } })

  return {
    success: true,
  }
})
