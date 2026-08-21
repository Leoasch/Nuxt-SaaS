import { ensureBucket } from '../utils/storage'

export default defineNitroPlugin(async () => {
  await ensureBucket()

  console.log('MinIO bucket ready')
})
