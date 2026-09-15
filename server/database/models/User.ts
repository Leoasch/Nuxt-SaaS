import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '..'

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User, { omit: 'avatarUrl' }>
> {
  declare id: CreationOptional<string>
  declare name: string
  declare email: string
  declare passwordHash: string
  declare avatarKey: string | null
  declare avatarUrl: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
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
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatarKey: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    avatarUrl: {
      type: DataTypes.VIRTUAL(DataTypes.STRING, ['avatarKey', 'id', 'updatedAt']),
      get (this: User) {
        return this.avatarKey ? `/api/users/${this.id}/avatar?v=${this.updatedAt.getTime()}` : null
      }
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true
  }
)
