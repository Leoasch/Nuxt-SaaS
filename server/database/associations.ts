import { Customer } from './models/Customer'
import { Organization } from './models/Organization'
import { OrganizationMember } from './models/OrganizationMember'
import { Product } from './models/Product'
import { ProductImage } from './models/ProductImage'
import { Sale } from './models/Sale'
import { SaleItem } from './models/SaleItem'
import { StockMovement } from './models/StockMovements'
import { User } from './models/User'

export function registerAssociations () {
  Organization.hasMany(OrganizationMember, { foreignKey: 'organization_id' })
  OrganizationMember.belongsTo(Organization, { foreignKey: 'organization_id' })

  User.hasMany(OrganizationMember, { foreignKey: 'user_id' })
  OrganizationMember.belongsTo(User, { foreignKey: 'user_id' })

  Organization.hasMany(Customer, { foreignKey: 'organization_id' })
  Customer.belongsTo(Organization, { foreignKey: 'organization_id' })

  Organization.hasMany(Product, { foreignKey: 'organization_id' })
  Product.belongsTo(Organization, { foreignKey: 'organization_id' })

  Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' })
  ProductImage.belongsTo(Product, { foreignKey: 'product_id' })

  Organization.hasMany(StockMovement, { foreignKey: 'organization_id' })
  StockMovement.belongsTo(Organization, { foreignKey: 'organization_id' })

  User.hasMany(StockMovement, { foreignKey: 'user_id' })
  StockMovement.belongsTo(User, { foreignKey: 'user_id' })

  Product.hasMany(StockMovement, { foreignKey: 'product_id' })
  StockMovement.belongsTo(Product, { foreignKey: 'product_id' })

  Organization.hasMany(Sale, { foreignKey: 'organization_id' })
  Sale.belongsTo(Organization, { foreignKey: 'organization_id' })

  User.hasMany(Sale, { foreignKey: 'user_id' })
  Sale.belongsTo(User, { foreignKey: 'user_id' })

  Customer.hasMany(Sale, { foreignKey: 'customer_id' })
  Sale.belongsTo(Customer, { foreignKey: 'customer_id' })

  Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'sale_items', onDelete: 'CASCADE' })
  SaleItem.belongsTo(Sale, { foreignKey: 'sale_id' })

  Product.hasMany(SaleItem, { foreignKey: 'product_id' })
  SaleItem.belongsTo(Product, { foreignKey: 'product_id' })
}
