import { User } from '~~/server/database/models/User'
import { uploadObject } from '~~/server/utils/storage'
import { assertContentLength } from '~~/server/utils/uploads'
import { MAX_IMAGE_SIZE, maxUploadBytes } from '~~/shared/utils/uploads'
import { assertNotDemoAccount } from '~~/server/utils/demo'

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)
  await assertNotDemoAccount(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  if (id !== sessionUser.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only update your own avatar.',
      data: {
        code: 'USER.NOT_ALLOWED',
      },
    })
  }

  assertContentLength(event, maxUploadBytes(1), 'AVATAR.TOO_LARGE')

  const parts = await readMultipartFormData(event)
  const file = (parts ?? []).find(part => part.name === 'avatar' && part.filename)

  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No image sent',
      data: {
        code: 'AVATAR.EMPTY',
      },
    })
  }

  if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported image type',
      data: {
        code: 'AVATAR.INVALID_TYPE',
      },
    })
  }

  if (file.data.length > MAX_IMAGE_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Image too large',
      data: {
        code: 'AVATAR.TOO_LARGE',
      },
    })
  }

  const user = await User.findOne({ where: { id } })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
      data: {
        code: 'USER.NOT_FOUND',
      },
    })
  }

  const key = `avatars/${id}`

  await uploadObject(key, file.data, file.type)

  user.avatarKey = key
  await user.save()

  const avatarUrl = user.avatarUrl

  await setUserSession(event, {
    user: { ...sessionUser, avatarUrl }
  })

  return { avatarUrl }
})
