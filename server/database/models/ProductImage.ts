import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '..'

export class ProductImage extends Model<
  InferAttributes<ProductImage>,
  InferCreationAttributes<ProductImage>
> {
  declare id: CreationOptional<string>
  declare product_id: string
  declare key: string
  declare mime_type: string
  declare size: number
}

ProductImage.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: () => crypto.randomUUID(),
      primaryKey: true
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'product_images',
    timestamps: true
  }
)
