import { z } from 'zod'
import { sequelize } from '~~/server/database'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { Sale } from '~~/server/database/models/Sale'
import { StockMovement } from '~~/server/database/models/StockMovements'
import { User } from '~~/server/database/models/User'
import { parseBody } from '~~/server/utils/accessValidation'
import { findOwnedOrganizations } from '~~/server/utils/ownedOrganizations'
import { deleteObject } from '~~/server/utils/storage'

const deleteAccountSchema = z.object({
  password: z.string()
})

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)

  const result = await parseBody(event, deleteAccountSchema)

  const { password } = result.data

  const user = await User.findOne({ where: { id: sessionUser.id } })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
      data: {
        code: 'USER.NOT_FOUND',
      },
    })
  }

  const passwordValid = await verifyPassword(user.passwordHash, password)

  if (!passwordValid) {
    throw createError({
      statusCode: 401,
      data: {
        code: 'AUTH_INVALID_CREDENTIALS'
      }
    })
  }

  const ownedOrganizations = await findOwnedOrganizations(user.id)

  if (ownedOrganizations.length > 0) {
    throw createError({
      statusCode: 405,
      statusMessage: 'Transfer ownership or delete these organizations before deleting your account.',
      data: {
        code: 'ACCOUNT.OWNS_ORGANIZATIONS',
        organizations: ownedOrganizations.map(organization => organization.name)
      }
    })
  }

  await sequelize.transaction(async (transaction) => {
    await StockMovement.update(
      { user_id: null },
      { where: { user_id: user.id }, transaction }
    )
    await Sale.update(
      { user_id: null },
      { where: { user_id: user.id }, transaction }
    )
    await OrganizationMember.destroy({ where: { user_id: user.id }, transaction })
    await user.destroy({ transaction })
  })

  if (user.avatarKey) {
    try {
      await deleteObject(user.avatarKey)
    } catch {
      // orphaned MinIO object, non-fatal
    }
  }

  await clearUserSession(event)

  return {
    success: true,
  }
})
