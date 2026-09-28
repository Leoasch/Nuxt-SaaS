import type { H3Event } from 'h3'

export function assertContentLength (event: H3Event, maxBytes: number, code: string) {
  const length = Number(getRequestHeader(event, 'content-length'))

  if (length > maxBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Upload too large',
      data: {
        code
      }
    })
  }
}
