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
  declare passwordHash: string | null
  declare googleId: string | null
  declare avatarKey: string | null
  declare avatarUrl: string | null
  declare resetPasswordTokenHash: string | null
  declare resetPasswordTokenExpiresAt: Date | null
  declare locale: string | null
  declare emailVerifiedAt: Date | null
  declare emailVerificationTokenHash: string | null
  declare emailVerificationTokenExpiresAt: Date | null
  declare sessionVersion: CreationOptional<number>
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
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
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
    resetPasswordTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    resetPasswordTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    locale: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    emailVerificationTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    emailVerificationTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    sessionVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { name: 'users_email_unique', unique: true, fields: ['email'] },
      { name: 'users_google_id_unique', unique: true, fields: ['googleId'] }
    ]
  }
)
