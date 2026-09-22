import { z } from 'zod'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { User } from '~~/server/database/models/User'
import { organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'
import { sendMail } from '~~/server/utils/mailer'

const addMemberSchema = z.object({
  user_id: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'])
})

export default defineEventHandler(async (event) => {
  const { organization, membership, user: inviter } = await organizationAccessValidation(event, ['MANAGER'])

  const result = await parseBody(event, addMemberSchema)

  const {
    user_id,
    role
  } = result.data

  if (!hasMinimumRole(membership.role, role)) {
    throw createError({
      statusCode: 405,
      statusMessage: 'User does not have permission to add a member with this role.',
      data: {
        code: 'MEMBERSHIP.NOT_ALLOWED',
      },
    })
  }

  const user = await User.findOne({ where: { id: user_id } })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
      data: {
        code: 'USER.NOT_FOUND',
      },
    })
  }

  const existingMember = await OrganizationMember.findOne({ where: { organization_id: organization.id, user_id } })

  if (existingMember) {
    throw createError({
      statusCode: 405,
      statusMessage: 'User is already a member of this organization.',
      data: {
        code: 'MEMBERSHIP.ALREADY_EXISTS',
      },
    }) 
  }

  const newMembership = await OrganizationMember.create({
    organization_id: organization.id,
    role,
    user_id
  })

  try {
    const config = useRuntimeConfig()
    const rendered = await renderEmail('OrganizationInvite', {
      organizationName: organization.name,
      inviterName: inviter.name,
      loginUrl: `${config.appUrl}/auth/login`
    })
    await sendMail(user.email, { subject: rendered.subject ?? `You've been invited to join ${organization.name}`, html: rendered.html, text: rendered.text })
  } catch (error) {
    console.error('Failed to send organization invite email', error)
  }

  return { membership: newMembership }
})
