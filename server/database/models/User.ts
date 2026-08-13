import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '..'

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: string
  declare name: string
  declare email: string
  declare password: string
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: () => crypto.randomUUID(),
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true
  }
)
