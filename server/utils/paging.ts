import type { H3Event } from 'h3'
import z from 'zod'
import type { PagingMetadata } from '~~/shared/types'


const pagingSChema = z.object({
  limit: z.coerce.number().int().min(1).optional(),
  index: z.coerce.number().int().min(0).optional()
})

export function getPagingParams (event: H3Event<globalThis.EventHandlerRequest>) {
  const { data } = parseQuery(event, pagingSChema)

  return {
    limit: data.limit ?? 25,
    index: data.index ?? 0
  }
}

export const makePage = (count: number, { limit, index }: { limit: number, index: number }): PagingMetadata => {
  return {
    count,
    limit,
    index,
    pages: Math.ceil(count / limit)
  }
}