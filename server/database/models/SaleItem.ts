import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '..'
import { decimalToNumber } from '~~/server/utils/dataHandler'

export class SaleItem extends Model<
  InferAttributes<SaleItem>,
  InferCreationAttributes<SaleItem>
> {
  declare id: CreationOptional<string>
  declare sale_id: string
  declare product_id: string
  declare quantity: number
  declare unit_price: number
  declare original_unit_price: number
  declare unit_cost: number | null
  declare total: number
}

SaleItem.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: () => crypto.randomUUID(),
      primaryKey: true
    },
    sale_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get (this: SaleItem) {
        return decimalToNumber.call(this, 'unit_price')
      }
    },
    original_unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get (this: SaleItem) {
        return decimalToNumber.call(this, 'original_unit_price')
      }
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      get (this: SaleItem) {
        return decimalToNumber.call(this, 'unit_cost')
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get (this: SaleItem) {
        return decimalToNumber.call(this, 'total')
      }
    }
  },
  {
    sequelize,
    tableName: 'sales_items',
    timestamps: true
  }
)
