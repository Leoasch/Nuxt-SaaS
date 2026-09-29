// Must be the first import of the seeder entry: the models and storage utils call
// `useRuntimeConfig()` (a Nitro auto-import) while they are being loaded, and outside
// Nitro that function does not exist.
//
// `--env-file <path>` loads only that file and disables the docker-compose defaults, so a
// missing key stops the script instead of mixing, say, a production database with local storage.

const LOCAL_DEFAULTS = {
  NUXT_DATABASE_HOST: 'localhost',
  NUXT_DATABASE_PORT: '5432',
  NUXT_DATABASE_NAME: 'main',
  NUXT_DATABASE_USER: 'admin',
  NUXT_DATABASE_PASSWORD: 'Q7i{G8HU?71gKpv',
  NUXT_S3_ENDPOINT: 'http://localhost:9000',
  NUXT_S3_REGION: 'us-east-1',
  NUXT_S3_BUCKET: 'images',
  NUXT_S3_ACCESS_KEY_ID: 'minioadmin',
  NUXT_S3_SECRET_ACCESS_KEY: 'minioadmin'
}

type SettingKey = keyof typeof LOCAL_DEFAULTS

function exitWith (message: string): never {
  console.error(message)
  process.exit(1)
}

function envFileArgument () {
  const args = process.argv.slice(2)

  for (const [index, arg] of args.entries()) {
    if (arg.startsWith('--env-file=')) {
      return arg.slice('--env-file='.length) || exitWith('--env-file needs a path')
    }
    if (arg === '--env-file') {
      const path = args[index + 1]
      return path && !path.startsWith('--') ? path : exitWith('--env-file needs a path')
    }
  }
}

const envFile = envFileArgument()

if (envFile) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    exitWith(`Could not read ${envFile}`)
  }

  const missing = (Object.keys(LOCAL_DEFAULTS) as SettingKey[]).filter(key => !process.env[key])

  if (missing.length > 0) {
    exitWith(`Missing in ${envFile}: ${missing.join(', ')}`)
  }
} else {
  try {
    process.loadEnvFile('.env')
  } catch {
    // No .env file: fall back to the docker-compose defaults.
  }
}

const setting = (key: SettingKey) => process.env[key] ?? LOCAL_DEFAULTS[key]

const config = {
  databaseHost: setting('NUXT_DATABASE_HOST'),
  databasePort: setting('NUXT_DATABASE_PORT'),
  databaseName: setting('NUXT_DATABASE_NAME'),
  databaseUser: setting('NUXT_DATABASE_USER'),
  databasePassword: setting('NUXT_DATABASE_PASSWORD'),
  databaseSsl: process.env.NUXT_DATABASE_SSL === 'true',
  s3Endpoint: setting('NUXT_S3_ENDPOINT'),
  s3Region: setting('NUXT_S3_REGION'),
  s3Bucket: setting('NUXT_S3_BUCKET'),
  s3AccessKeyId: setting('NUXT_S3_ACCESS_KEY_ID'),
  s3SecretAccessKey: setting('NUXT_S3_SECRET_ACCESS_KEY')
}

Object.assign(globalThis, { useRuntimeConfig: () => config })
