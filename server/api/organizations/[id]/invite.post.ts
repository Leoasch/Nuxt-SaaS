import { z } from 'zod'
import { sequelize } from '~~/server/database'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { User } from '~~/server/database/models/User'
import { organizationAccessValidation, parseBody } from '~~/server/utils/accessValidation'
import { sendMail } from '~~/server/utils/mailer'
import { emailMessages } from '~~/shared/emails/messages'

const addMemberSchema = z.object({
  email: z.email(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'])
})

export default defineEventHandler(async (event) => {
  const { organization, membership, user: inviter } = await organizationAccessValidation(event, ['MANAGER'])

  const result = await parseBody(event, addMemberSchema)

  const {
    email,
    role
  } = result.data

  if (!hasMinimumRole(membership.role, role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User does not have permission to add a member with this role.',
      data: {
        code: 'MEMBERSHIP.NOT_ALLOWED',
      },
    })
  }

  const user = await User.findOne({
    where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), email.toLowerCase())
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
      data: {
        code: 'USER.NOT_FOUND',
      },
    })
  }

  const existingMember = await OrganizationMember.findOne({ where: { organization_id: organization.id, user_id: user.id } })

  if (existingMember) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User is already a member of this organization.',
      data: {
        code: 'MEMBERSHIP.ALREADY_EXISTS',
      },
    }) 
  }

  const newMembership = await OrganizationMember.create({
    organization_id: organization.id,
    role,
    user_id: user.id
  })

  try {
    const config = useRuntimeConfig()
    const locale = toAppLocale(user.locale)
    const params = { organizationName: organization.name, inviterName: inviter.name }
    const rendered = await renderEmail('OrganizationInvite', {
      ...params,
      loginUrl: `${config.appUrl}/auth/login`,
      locale
    })
    await sendMail(user.email, { subject: rendered.subject ?? emailMessages(locale).organizationInvite.subject(params), html: rendered.html, text: rendered.text })
  } catch (error) {
    console.error('Failed to send organization invite email', error)
  }

  return { membership: newMembership }
})
