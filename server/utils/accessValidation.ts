
import type { H3Event } from 'h3'
import { Organization } from '../database/models/Organization'
import { OrganizationMember } from '../database/models/OrganizationMember'
import type { Role } from '~~/shared/types'
import { Product } from '../database/models/Product'
import { Customer } from '../database/models/Customer'
import type z from 'zod'

export async function organizationAccessValidation (event: H3Event<globalThis.EventHandlerRequest>, requiredRoles: Role[] = []) {
  const { user } = await requireUserSession(event)
  
  const organization_id = getRouterParam(event, 'id')

  if (!organization_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  const membership = await OrganizationMember.findOne({
    where: { user_id: user.id, organization_id }
  })
  
  if (!membership) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Organization not found',
      data: {
        code: 'ORGANIZATION.NOT_FOUND',
      },
    })
  }
  
  const organization = await Organization.findOne({ where: { id: organization_id } })
  
  if (!organization) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Organization not found',
      data: {
        code: 'ORGANIZATION.NOT_FOUND',
      },
    })
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
    throw createError({
      statusCode: 405,
      statusMessage: 'User does not have permission to execute that task.',
      data: {
        code: 'ORGANIZATION.NOT_ALLOWED',
      },
    })
  }

  return {
    organization,
    membership,
    user
  }
}

export async function accessProduct (event: H3Event<globalThis.EventHandlerRequest>, organization_id: string) {
  const product_id = getRouterParam(event, 'prod_id')

  if (!product_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }
  
  const product = await Product.findOne({ where: { id: product_id, organization_id } })
  
  if (!product) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found.',
      data: {
        code: 'PRODUCT.NOT_FOUND',
      },
    })
  }

  return { product }
}

export async function accessCustomer (event: H3Event<globalThis.EventHandlerRequest>, organization_id: string) {
  const customer_id = getRouterParam(event, 'cust_id')

  if (!customer_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }
  
  const customer = await Customer.findOne({ where: { id: customer_id, organization_id } })
  
  if (!customer) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Customer not found.',
      data: {
        code: 'CUSTOMER.NOT_FOUND',
      },
    })
  }

  return { customer }
}

export async function parseBody<T extends z.ZodType> (event: H3Event<globalThis.EventHandlerRequest>, schema: T) {
  const body = await readBody(event)

  const result = await schema.safeParseAsync(body)

  if (!result.success) {
    const fields: Record<string, string> = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !fields[field]) {
        fields[field] = issue.code === 'custom' ? issue.message : issue.code
      }
    }

    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: {
        code: 'VALIDATION_ERROR',
        fields,
      },
    })
  }

  return result as z.ZodSafeParseSuccess<z.infer<T>>
}