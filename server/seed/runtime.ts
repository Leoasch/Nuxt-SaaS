// Must be the first import of the seeder entry: the models and storage utils call
// `useRuntimeConfig()` (a Nitro auto-import) while they are being loaded, and outside
// Nitro that function does not exist.
try {
  process.loadEnvFile('.env')
} catch {
  // No .env file: fall back to the docker-compose defaults below.
}

const env = process.env

const config = {
  databaseHost: env.NUXT_DATABASE_HOST ?? 'localhost',
  databasePort: env.NUXT_DATABASE_PORT ?? '5432',
  databaseName: env.NUXT_DATABASE_NAME ?? 'main',
  databaseUser: env.NUXT_DATABASE_USER ?? 'admin',
  databasePassword: env.NUXT_DATABASE_PASSWORD ?? 'Q7i{G8HU?71gKpv',
  s3Endpoint: env.NUXT_S3_ENDPOINT ?? 'http://localhost:9000',
  s3Region: env.NUXT_S3_REGION ?? 'us-east-1',
  s3Bucket: env.NUXT_S3_BUCKET ?? 'images',
  s3AccessKeyId: env.NUXT_S3_ACCESS_KEY_ID ?? 'minioadmin',
  s3SecretAccessKey: env.NUXT_S3_SECRET_ACCESS_KEY ?? 'minioadmin'
}

Object.assign(globalThis, { useRuntimeConfig: () => config })
