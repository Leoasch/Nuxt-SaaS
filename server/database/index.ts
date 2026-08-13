import { Sequelize } from 'sequelize'

const config = useRuntimeConfig()

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.databaseHost,
  port: Number(config.databasePort),
  database: config.databaseName,
  username: config.databaseUser,
  password: config.databasePassword,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})
