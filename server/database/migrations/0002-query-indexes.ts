import type { QueryInterface } from 'sequelize'

const INDEXES = [
  { table: 'sales', fields: ['organization_id', 'createdAt'], name: 'sales_organization_id_created_at' },
  { table: 'sales_items', fields: ['sale_id'], name: 'sales_items_sale_id' },
  { table: 'sales_items', fields: ['product_id'], name: 'sales_items_product_id' },
  { table: 'stock_movements', fields: ['organization_id', 'createdAt'], name: 'stock_movements_organization_id_created_at' },
  { table: 'stock_movements', fields: ['product_id'], name: 'stock_movements_product_id' },
  { table: 'customers', fields: ['organization_id'], name: 'customers_organization_id' },
  { table: 'product_images', fields: ['product_id'], name: 'product_images_product_id' },
  { table: 'organizations_members', fields: ['user_id'], name: 'organizations_members_user_id' }
]

export async function up ({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    for (const { table, fields, name } of INDEXES) {
      await queryInterface.addIndex(table, fields, { name, transaction })
    }
  })
}

export async function down ({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    for (const { table, name } of INDEXES) {
      await queryInterface.removeIndex(table, name, { transaction })
    }
  })
}
