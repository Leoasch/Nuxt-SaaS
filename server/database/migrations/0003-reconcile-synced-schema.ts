import type { QueryInterface } from 'sequelize'

// Databases created by the old sync({ alter: true }) kept NOT NULL on these columns and an unused enum.
// On a database built from 0001 every statement here is a no-op.
export async function up ({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query('ALTER TABLE sales ALTER COLUMN user_id DROP NOT NULL', { transaction })
    await queryInterface.sequelize.query('ALTER TABLE stock_movements ALTER COLUMN user_id DROP NOT NULL', { transaction })
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_stock_movements_type"', { transaction })
  })
}

// Nothing to undo: restoring NOT NULL would break account deletion again.
export async function down () {}
