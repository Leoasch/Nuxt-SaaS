import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import type { InferCreationAttributes } from 'sequelize'
import type { Customer } from '~~/server/database/models/Customer'
import type { Organization } from '~~/server/database/models/Organization'
import type { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import type { Product } from '~~/server/database/models/Product'
import type { ProductImage } from '~~/server/database/models/ProductImage'
import type { User } from '~~/server/database/models/User'
import { loadCatalog, selectProducts } from './catalog'
import {
  SEED_MEMBERSHIPS,
  SEED_ORGS,
  SEED_PASSWORD,
  SEED_USERS,
  generateCnpj,
  generateCustomers
} from './people'
import { int, round2, random } from './random'
import type { SimMember, SimulationResult, Stamped } from './simulate'
import { initialStockFor, minimumStockFor, simulate } from './simulate'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const DAYS_OF_HISTORY = 90

export interface ImageUpload {
  key: string
  path: string
  mime: string
}

export interface SeedDataset {
  users: Stamped<InferCreationAttributes<User, { omit: 'avatarUrl' }>>[]
  organizations: Stamped<InferCreationAttributes<Organization>>[]
  memberships: Stamped<InferCreationAttributes<OrganizationMember, { omit: 'pending_invite' }>>[]
  customers: Stamped<InferCreationAttributes<Customer>>[]
  products: Stamped<InferCreationAttributes<Product>>[]
  productImages: Stamped<InferCreationAttributes<ProductImage>>[]
  stockMovements: SimulationResult['stockMovements']
  sales: SimulationResult['sales']
  saleItems: SimulationResult['saleItems']
  uploads: ImageUpload[]
  logins: { email: string, access: string[] }[]
}

// Fetches the catalog and every image first; nothing here touches the database.
export async function buildDataset (now: Date): Promise<SeedDataset> {
  const catalog = await loadCatalog()
  const passwordHash = await new Hash(new Scrypt({})).make(SEED_PASSWORD)

  const today = now.getTime() - (now.getTime() % DAY)
  const at = (daysAgo: number, hourOffset = 13) => new Date(today - daysAgo * DAY + hourOffset * HOUR + int(0, 59) * MINUTE)

  const dataset: SeedDataset = {
    users: [],
    organizations: [],
    memberships: [],
    customers: [],
    products: [],
    productImages: [],
    stockMovements: [],
    sales: [],
    saleItems: [],
    uploads: [],
    logins: []
  }

  // Julia and Lucas signed up recently; everyone else predates the organizations.
  const recentUsers = new Set(['julia', 'lucas'])
  const userIds = new Map<string, string>()
  const userCreatedAt = new Map<string, Date>()
  const access = new Map<string, string[]>()

  for (const def of SEED_USERS) {
    const createdAt = recentUsers.has(def.key) ? at(int(5, 15), 14) : at(int(95, 120), 14)

    userIds.set(def.key, crypto.randomUUID())
    userCreatedAt.set(def.key, createdAt)
    access.set(def.key, [])

    dataset.users.push({
      id: userIds.get(def.key)!,
      name: def.name,
      email: def.email,
      passwordHash,
      avatarKey: null,
      googleId: null,
      resetPasswordTokenHash: null,
      resetPasswordTokenExpiresAt: null,
      createdAt,
      updatedAt: createdAt
    })
  }

  for (const orgDef of SEED_ORGS) {
    console.log(`  ${orgDef.name}: fetching product photos…`)

    const organization_id = crypto.randomUUID()
    const startsAt = at(DAYS_OF_HISTORY + 1)

    dataset.organizations.push({
      id: organization_id,
      name: orgDef.name,
      document: generateCnpj(),
      createdAt: startsAt,
      updatedAt: startsAt
    })

    const members: SimMember[] = []

    for (const def of SEED_MEMBERSHIPS.filter(membership => membership.org === orgDef.key)) {
      const user_id = userIds.get(def.user)!
      const isOwner = def.role === 'OWNER'
      const createdAt = def.pending
        ? new Date(userCreatedAt.get(def.user)!.getTime() + DAY)
        : isOwner ? startsAt : new Date(startsAt.getTime() + int(0, 7) * DAY)
      const acceptedAt = def.pending ? null : new Date(createdAt.getTime() + (isOwner ? 0 : int(1, 48) * HOUR))

      dataset.memberships.push({
        organization_id,
        user_id,
        role: def.role,
        accepted_at: acceptedAt,
        createdAt,
        updatedAt: acceptedAt ?? createdAt
      })

      if (acceptedAt) {
        members.push({ user_id, role: def.role, acceptedAt })
      }

      access.get(def.user)!.push(`${orgDef.name} (${def.role}${def.pending ? ', invite pending' : ''})`)
    }

    const customers = generateCustomers(orgDef.customerCount).map((customer) => {
      const createdAt = new Date(startsAt.getTime() + int(0, 60) * DAY + int(0, 10) * HOUR)

      return { id: crypto.randomUUID(), organization_id, ...customer, createdAt, updatedAt: createdAt }
    })

    dataset.customers.push(...customers)

    const catalogProducts = await selectProducts(catalog, orgDef.categories, orgDef.productCount)

    const products = catalogProducts.map((item) => {
      const initial_stock = initialStockFor(item.salePrice)
      const createdAt = new Date(startsAt.getTime() + int(0, 90) * MINUTE)

      return {
        id: crypto.randomUUID(),
        organization_id,
        name: item.title,
        sku: item.sku,
        barcode: item.barcode,
        cost_price: round2(item.salePrice * (0.55 + random() * 0.17)),
        sale_price: item.salePrice,
        stock_quantity: 0,
        minimum_stock: minimumStockFor(initial_stock),
        initial_stock,
        images: item.images,
        createdAt,
        updatedAt: createdAt
      }
    })

    for (const product of products) {
      for (const image of product.images) {
        const id = crypto.randomUUID()
        // Same key layout as POST /products/:id/images so the API serves these like uploaded images.
        const key = `products/${product.id}/${id}`

        dataset.productImages.push({
          id,
          product_id: product.id,
          key,
          mime_type: image.mime,
          size: image.size,
          createdAt: product.createdAt,
          updatedAt: product.createdAt
        })
        dataset.uploads.push({ key, path: image.path, mime: image.mime })
      }
    }

    const simulation = simulate({
      organization_id,
      startsAt,
      now,
      days: DAYS_OF_HISTORY,
      salesPerDay: orgDef.salesPerDay,
      members,
      customers,
      products: products.map(product => ({
        id: product.id,
        sale_price: product.sale_price,
        minimum_stock: product.minimum_stock,
        initial_stock: product.initial_stock
      }))
    })

    // The ledger and the stored quantity must agree: stock_quantity == SUM(stock_movements.quantity).
    dataset.products.push(...products.map(({ initial_stock, images, ...product }) => ({
      ...product,
      stock_quantity: simulation.finalStock.get(product.id) ?? 0
    })))

    dataset.stockMovements.push(...simulation.stockMovements)
    dataset.sales.push(...simulation.sales)
    dataset.saleItems.push(...simulation.saleItems)
  }

  dataset.logins = SEED_USERS.map(def => ({ email: def.email, access: access.get(def.key)! }))

  return dataset
}
