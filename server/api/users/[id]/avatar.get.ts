import { User } from '~~/server/database/models/User'
import { getObjectWithMeta } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  const user = await User.findOne({ where: { id }, attributes: ['id', 'avatarKey'] })

  if (!user || !user.avatarKey) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Avatar not found.',
      data: {
        code: 'AVATAR.NOT_FOUND',
      },
    })
  }

  const { body, contentType, contentLength } = await getObjectWithMeta(user.avatarKey)

  setResponseHeader(event, 'Content-Type', contentType ?? 'application/octet-stream')
  if (contentLength !== undefined) {
    setResponseHeader(event, 'Content-Length', contentLength)
  }
  setResponseHeader(event, 'Cache-Control', 'private, max-age=31536000, immutable')

  return body
})
