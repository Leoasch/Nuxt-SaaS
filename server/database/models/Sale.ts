import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '..'

export class Sale extends Model<
  InferAttributes<Sale>,
  InferCreationAttributes<Sale>
> {
  declare id: CreationOptional<string>
  declare organization_id: string
  declare customer_id: string
  declare user_id: string
  declare subtotal: number
  declare discount: number
  declare total: number
  declare payment_method: string
}

Sale.init(
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
    customer_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'sales',
    timestamps: true
  }
)
