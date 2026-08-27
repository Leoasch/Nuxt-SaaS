import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '..'

export class StockMovement extends Model<
  InferAttributes<StockMovement>,
  InferCreationAttributes<StockMovement>
> {
  declare id: CreationOptional<string>
  declare organization_id: string
  declare user_id: string
  declare product_id: string
  declare quantity: number
  declare reason: string | null
}

StockMovement.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: () => crypto.randomUUID(),
      primaryKey: true
    },
    organization_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
  },
  {
    sequelize,
    tableName: 'stock_movements',
    timestamps: true
  }
)
