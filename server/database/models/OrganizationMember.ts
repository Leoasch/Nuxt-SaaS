import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '..'
import type { Role } from '~~/shared/types'

export class OrganizationMember extends Model<
  InferAttributes<OrganizationMember>,
  InferCreationAttributes<OrganizationMember, { omit: 'pending_invite' }>
> {
  declare organization_id: string
  declare user_id: string
  declare role: Role
  declare accepted_at: Date | null
  declare pending_invite: boolean
}

OrganizationMember.init(
  {
    organization_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'MANAGER', 'EMPLOYEE'),
      allowNull: false
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    pending_invite: {
      type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['accepted_at']),
      get (this: OrganizationMember) {
        return this.accepted_at === null
      }
    }
  },
  {
    sequelize,
    tableName: 'organizations_members'
  }
)
