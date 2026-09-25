import { User } from '~~/server/database/models/User'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) {
    return
  }

  const session = await getUserSession(event)

  if (!session.user) {
    return
  }

  const user = await User.findByPk(session.user.id, { attributes: ['id', 'sessionVersion'] })

  if (user && user.sessionVersion === session.secure?.sessionVersion) {
    return
  }

  await clearUserSession(event)

  const sessionName = useRuntimeConfig(event).session.name
  const headers = event.node.req.headers
  headers[`x-${sessionName.toLowerCase()}-session`] = undefined
  headers.cookie = headers.cookie
    ?.split(';')
    .filter(cookie => cookie.split('=')[0]?.trim() !== sessionName)
    .join(';')
})
