import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '..'

export class OrganizationMember extends Model<
  InferAttributes<OrganizationMember>,
  InferCreationAttributes<OrganizationMember>
> {
  declare organization_id: string
  declare user_id: string
  declare role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
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
    }
  },
  {
    sequelize,
    tableName: 'organizations_members'
  }
)
