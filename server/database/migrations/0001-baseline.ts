import { DataTypes, type QueryInterface } from 'sequelize'

const timestamps = {
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false }
}

const references = (table: string, onDelete: 'CASCADE' | 'SET NULL') => ({
  references: { model: table, key: 'id' },
  onDelete,
  onUpdate: 'CASCADE'
})

export async function up ({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('users', {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      passwordHash: { type: DataTypes.STRING, allowNull: true },
      googleId: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      avatarKey: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      resetPasswordTokenHash: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      resetPasswordTokenExpiresAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
      locale: { type: DataTypes.STRING(10), allowNull: true, defaultValue: null },
      emailVerifiedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
      emailVerificationTokenHash: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      emailVerificationTokenExpiresAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
      sessionVersion: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE },
      updatedAt: { type: DataTypes.DATE }
    }, { transaction })
    await queryInterface.addIndex('users', ['email'], { name: 'users_email_unique', unique: true, transaction })
    await queryInterface.addIndex('users', ['googleId'], { name: 'users_google_id_unique', unique: true, transaction })

    await queryInterface.createTable('organizations', {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      document: { type: DataTypes.STRING, allowNull: true },
      ...timestamps
    }, { transaction })

    await queryInterface.createTable('organizations_members', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      organization_id: { type: DataTypes.STRING, allowNull: false, ...references('organizations', 'CASCADE') },
      user_id: { type: DataTypes.STRING, allowNull: false, ...references('users', 'CASCADE') },
      role: { type: DataTypes.ENUM('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE'), allowNull: false },
      accepted_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
      ...timestamps
    }, { transaction })
    await queryInterface.addIndex('organizations_members', ['organization_id'], {
      name: 'organizations_members_organization_id',
      unique: true,
      where: { role: 'OWNER' },
      transaction
    })

    await queryInterface.createTable('customers', {
      id: { type: DataTypes.STRING, primaryKey: true },
      organization_id: { type: DataTypes.STRING, allowNull: false, ...references('organizations', 'CASCADE') },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      document: { type: DataTypes.STRING, allowNull: true },
      ...timestamps
    }, { transaction })

    await queryInterface.createTable('products', {
      id: { type: DataTypes.STRING, primaryKey: true },
      organization_id: { type: DataTypes.STRING, allowNull: false, ...references('organizations', 'CASCADE') },
      name: { type: DataTypes.STRING, allowNull: false },
      sku: { type: DataTypes.STRING, allowNull: true },
      barcode: { type: DataTypes.STRING, allowNull: true },
      cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      sale_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      stock_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      minimum_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...timestamps,
      deletedAt: { type: DataTypes.DATE }
    }, { transaction })
    await queryInterface.addIndex('products', ['organization_id', 'sku'], {
      name: 'products_organization_id_sku',
      unique: true,
      where: { deletedAt: null },
      transaction
    })

    await queryInterface.createTable('product_images', {
      id: { type: DataTypes.STRING, primaryKey: true },
      product_id: { type: DataTypes.STRING, allowNull: false, ...references('products', 'CASCADE') },
      key: { type: DataTypes.STRING, allowNull: false },
      mime_type: { type: DataTypes.STRING, allowNull: false },
      size: { type: DataTypes.INTEGER, allowNull: false },
      ...timestamps
    }, { transaction })

    await queryInterface.createTable('stock_movements', {
      id: { type: DataTypes.STRING, primaryKey: true },
      organization_id: { type: DataTypes.STRING, allowNull: false, ...references('organizations', 'CASCADE') },
      user_id: { type: DataTypes.STRING, allowNull: true, ...references('users', 'SET NULL') },
      product_id: { type: DataTypes.STRING, allowNull: false, ...references('products', 'CASCADE') },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      reason: { type: DataTypes.TEXT, allowNull: true },
      ...timestamps
    }, { transaction })

    await queryInterface.createTable('sales', {
      id: { type: DataTypes.STRING, primaryKey: true },
      organization_id: { type: DataTypes.STRING, allowNull: false, ...references('organizations', 'CASCADE') },
      user_id: { type: DataTypes.STRING, allowNull: true, ...references('users', 'SET NULL') },
      customer_id: { type: DataTypes.STRING, allowNull: true, ...references('customers', 'SET NULL') },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_method: { type: DataTypes.STRING, allowNull: false },
      canceled_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
      createdAt: { type: DataTypes.DATE },
      updatedAt: { type: DataTypes.DATE }
    }, { transaction })

    await queryInterface.createTable('sales_items', {
      id: { type: DataTypes.STRING, primaryKey: true },
      sale_id: { type: DataTypes.STRING, allowNull: false, ...references('sales', 'CASCADE') },
      product_id: { type: DataTypes.STRING, allowNull: false, ...references('products', 'CASCADE') },
      quantity: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      original_unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: null },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      ...timestamps
    }, { transaction })
  })
}

export async function down ({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    const tables = ['sales_items', 'sales', 'stock_movements', 'product_images', 'products', 'customers', 'organizations_members', 'organizations', 'users']

    for (const table of tables) {
      await queryInterface.dropTable(table, { transaction })
    }

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organizations_members_role"', { transaction })
  })
}
