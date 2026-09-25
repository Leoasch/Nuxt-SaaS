import type { H3Event } from 'h3'
import type { User } from '../database/models/User'

export async function startUserSession (event: H3Event, user: User) {
  await replaceUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      hasPassword: !!user.passwordHash
    },
    secure: {
      sessionVersion: user.sessionVersion
    }
  })
}
