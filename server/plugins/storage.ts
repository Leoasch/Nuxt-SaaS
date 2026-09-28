import { ensureBucket } from '../utils/storage'

export default defineNitroPlugin(async () => {
  await ensureBucket()

  console.log('Object storage bucket ready')
})
