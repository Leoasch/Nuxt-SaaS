import type { Model } from 'sequelize'

export function decimalToNumber (this: Model, field: string) {
  const value = this.getDataValue(field)
  return value === null ? value : Number(value)
}