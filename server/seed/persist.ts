import { readFile } from 'node:fs/promises'
import type { Transaction } from 'sequelize'
import { Op } from 'sequelize'
import { sequelize } from '~~/server/database'
import { Customer } from '~~/server/database/models/Customer'
import { Organization } from '~~/server/database/models/Organization'
import { OrganizationMember } from '~~/server/database/models/OrganizationMember'
import { Product } from '~~/server/database/models/Product'
import { ProductImage } from '~~/server/database/models/ProductImage'
import { Sale } from '~~/server/database/models/Sale'
import { SaleItem } from '~~/server/database/models/SaleItem'
import { StockMovement } from '~~/server/database/models/StockMovements'
import { User } from '~~/server/database/models/User'
import { deleteObject, uploadObject } from '~~/server/utils/storage'
import type { SeedDataset } from './dataset'
import { SEED_EMAIL_DOMAIN } from './people'
import { chunk, mapPool } from './pool'

const INSERT_CHUNK_SIZE = 500
const ID_CHUNK_SIZE = 1000
const OBJECT_CONCURRENCY = 8

// Everything the seeder creates hangs off users with this email domain, which is how --reset
// finds its own data without ever touching what was created by hand.
const seedUsersWhere = { email: { [Op.like]: `%@${SEED_EMAIL_DOMAIN}` } }

export async function isSeeded () {
  return (await User.count({ where: seedUsersWhere })) > 0
}

async function insertRows (model: { bulkCreate: (rows: any[], options: any) => Promise<unknown> }, rows: unknown[], transaction: Transaction) {
  for (const rowsChunk of chunk(rows, INSERT_CHUNK_SIZE)) {
    await model.bulkCreate(rowsChunk, { transaction })
  }
}

export async function resetSeedData () {
  const users = await User.findAll({ where: seedUsersWhere, attributes: ['id', 'avatarKey'] })
  const userIds = users.map(user => user.id)

  if (userIds.length === 0) {
    return { users: 0, organizations: 0, objects: 0 }
  }

  const owned = await OrganizationMember.findAll({ where: { user_id: userIds, role: 'OWNER' }, attributes: ['organization_id'] })
  const organizationIds = owned.map(member => member.organization_id)

  const products = organizationIds.length > 0
    ? await Product.findAll({ where: { organization_id: organizationIds }, attributes: ['id'], paranoid: false })
    : []
  const productIds = products.map(product => product.id)

  const images = productIds.length > 0
    ? await ProductImage.findAll({ where: { product_id: productIds }, attributes: ['key'] })
    : []
  const objectKeys = [
    ...images.map(image => image.key),
    ...users.flatMap(user => user.avatarKey ? [user.avatarKey] : [])
  ]

  await sequelize.transaction(async (transaction) => {
    if (organizationIds.length > 0) {
      const sales = await Sale.findAll({ where: { organization_id: organizationIds }, attributes: ['id'], transaction })

      for (const ids of chunk(sales.map(sale => sale.id), ID_CHUNK_SIZE)) {
        await SaleItem.destroy({ where: { sale_id: ids }, transaction })
      }

      await Sale.destroy({ where: { organization_id: organizationIds }, transaction })
      await StockMovement.destroy({ where: { organization_id: organizationIds }, transaction })

      for (const ids of chunk(productIds, ID_CHUNK_SIZE)) {
        await ProductImage.destroy({ where: { product_id: ids }, transaction })
      }

      await Product.destroy({ where: { organization_id: organizationIds }, force: true, transaction })
      await Customer.destroy({ where: { organization_id: organizationIds }, transaction })
    }

    await OrganizationMember.destroy({
      where: { [Op.or]: [{ organization_id: organizationIds }, { user_id: userIds }] },
      transaction
    })

    if (organizationIds.length > 0) {
      await Organization.destroy({ where: { id: organizationIds }, transaction })
    }

    await User.destroy({ where: { id: userIds }, transaction })
  })

  // After the commit: a failure here leaves harmless orphan objects instead of dangling rows.
  await mapPool(objectKeys, OBJECT_CONCURRENCY, async (key) => {
    try {
      await deleteObject(key)
    } catch (error) {
      console.warn(`  ! could not delete object ${key}: ${(error as Error).message}`)
    }
  })

  return { users: userIds.length, organizations: organizationIds.length, objects: objectKeys.length }
}

export async function insertDataset (dataset: SeedDataset) {
  console.log(`  uploading ${dataset.uploads.length} images to the bucket…`)

  const uploaded: string[] = []

  await mapPool(dataset.uploads, OBJECT_CONCURRENCY, async (upload) => {
    await uploadObject(upload.key, await readFile(upload.path), upload.mime)
    uploaded.push(upload.key)
  })

  console.log('  inserting rows…')

  try {
    await sequelize.transaction(async (transaction) => {
      await insertRows(User, dataset.users, transaction)
      await insertRows(Organization, dataset.organizations, transaction)
      await insertRows(OrganizationMember, dataset.memberships, transaction)
      await insertRows(Customer, dataset.customers, transaction)
      await insertRows(Product, dataset.products, transaction)
      await insertRows(ProductImage, dataset.productImages, transaction)
      await insertRows(StockMovement, dataset.stockMovements, transaction)
      await insertRows(Sale, dataset.sales, transaction)
      await insertRows(SaleItem, dataset.saleItems, transaction)
    })
  } catch (error) {
    await Promise.allSettled(uploaded.map(key => deleteObject(key)))
    throw error
  }
}
