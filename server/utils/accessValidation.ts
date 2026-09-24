
import type { H3Event } from 'h3'
import { Organization } from '../database/models/Organization'
import { OrganizationMember } from '../database/models/OrganizationMember'
import type { Role } from '~~/shared/types'
import { Product } from '../database/models/Product'
import { ProductImage } from '../database/models/ProductImage'
import { Customer } from '../database/models/Customer'
import type z from 'zod'
import { StockMovement } from '../database/models/StockMovements'
import { Sale } from '../database/models/Sale'
import type { FindOptions, InferAttributes } from 'sequelize'

export async function organizationAccessValidation (
  event: H3Event<globalThis.EventHandlerRequest>,
  requiredRoles: Role[] = [],
  opts: { allowPending?: boolean, allowSelf?: boolean } = {}
) {
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

  if (!opts.allowPending && membership.pending_invite) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User has not accepted the invite to this organization.',
      data: {
        code: 'MEMBERSHIP.PENDING',
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

  const isSelf = !!opts.allowSelf && getRouterParam(event, 'member_id') === user.id

  if (requiredRoles.length > 0 && !isSelf && !requiredRoles.some(r => hasMinimumRole(membership.role, r))) {
    throw createError({
      statusCode: 403,
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

export async function accessMembership (
  event: H3Event<globalThis.EventHandlerRequest>, 
  organization_id: string, 
  member_id?: string,
  opts?: FindOptions<InferAttributes<OrganizationMember, {
    omit: never;
  }>>
) {
  if (!member_id) {
    member_id = getRouterParam(event, 'member_id')
  }

  if (!member_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  const membership = await OrganizationMember.findOne({
    where: { user_id: member_id, organization_id },
    ...opts
  })
  
  if (!membership) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Member not found',
      data: {
        code: 'MEMBERSHIP.NOT_FOUND',
      },
    })
  }

  return {
    membership,
  }
}

export async function accessProduct (event: H3Event<globalThis.EventHandlerRequest>, organization_id: string, product_id?: string) {
  
  if (!product_id) {
    product_id = getRouterParam(event, 'prod_id')
  }

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

export async function accessProductImage (event: H3Event<globalThis.EventHandlerRequest>, product_id: string) {
  const image_id = getRouterParam(event, 'image_id')

  if (!image_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  const image = await ProductImage.findOne({ where: { id: image_id, product_id } })

  if (!image) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found.',
      data: {
        code: 'PRODUCT_IMAGE.NOT_FOUND',
      },
    })
  }

  return { image }
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

export async function accessStockMv (event: H3Event<globalThis.EventHandlerRequest>, organization_id: string) {
  const stock_id = getRouterParam(event, 'stock_id')

  if (!stock_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  const stockMovement = await StockMovement.findOne({ where: { id: stock_id, organization_id } })

  if (!stockMovement) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Stock movement not found.',
      data: {
        code: 'STOCK.NOT_FOUND',
      },
    })
  }

  return { stockMovement }
}

export async function accessSale (
  event: H3Event<globalThis.EventHandlerRequest>, 
  organization_id: string, 
  opts?: FindOptions<InferAttributes<Sale, {
    omit: never;
  }>>
) {
  const sale_id = getRouterParam(event, 'sale_id')

  if (!sale_id) {
    // INVALID ID
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  const sale = await Sale.findOne({ where: { id: sale_id, organization_id }, ...opts })

  if (!sale) {
    // NOT FOUND ERROR
    throw createError({
      statusCode: 404,
      statusMessage: 'Sale not found.',
      data: {
        code: 'SALE.NOT_FOUND',
      },
    })
  }

  return { sale }
}

type FieldParams = { minimum?: number, maximum?: number, origin?: string, format?: string }

function throwValidationError (error: z.ZodError, input: unknown): never {
  const fields: Record<string, string> = {}
  const params: Record<string, FieldParams> = {}
  const values = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (typeof field !== 'string' || fields[field]) {
      continue
    }

    if (issue.code === 'custom') {
      fields[field] = issue.message
      continue
    }

    if (issue.path.length > 1) {
      fields[field] = 'invalid_item'
      continue
    }

    fields[field] = issue.code

    const value = values[field]
    const isEmpty = value === undefined || value === null || value === ''

    if ((issue.code === 'invalid_type' && isEmpty) || (issue.code === 'too_small' && issue.origin === 'string' && Number(issue.minimum) <= 1)) {
      fields[field] = 'required'
    } else if (issue.code === 'too_small') {
      params[field] = { minimum: Number(issue.minimum), origin: issue.origin }
    } else if (issue.code === 'too_big') {
      params[field] = { maximum: Number(issue.maximum), origin: issue.origin }
    } else if (issue.code === 'invalid_format') {
      params[field] = { format: issue.format }
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Validation Error',
    data: {
      code: 'VALIDATION_ERROR',
      fields,
      params,
    },
  })
}

export async function parseBody<T extends z.ZodType> (event: H3Event<globalThis.EventHandlerRequest>, schema: T) {
  const body = await readBody(event)

  const result = await schema.safeParseAsync(body)

  if (!result.success) {
    throwValidationError(result.error, body)
  }

  return result as z.ZodSafeParseSuccess<z.infer<T>>
}

export function parseQuery<T extends z.ZodType> (event: H3Event<globalThis.EventHandlerRequest>, schema: T) {
  const query = getQuery(event)

  const result = schema.safeParse(query)

  if (!result.success) {
    throwValidationError(result.error, query)
  }

  return result as z.ZodSafeParseSuccess<z.infer<T>>
}