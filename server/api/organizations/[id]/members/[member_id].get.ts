import { User } from '~~/server/database/models/User'
import { organizationAccessValidation, accessMembership } from '~~/server/utils/accessValidation'

export default defineEventHandler(async (event) => {
  const { organization } = await organizationAccessValidation(event)
  
  const { membership } = await accessMembership(
    event, 
    organization.id, 
    undefined, 
    { include: { model: User, as: 'user', attributes: ['id', 'name', 'email'] } }
  )
  
  return { membership }
})
