import { transporter } from '../utils/mailer'

export default defineNitroPlugin(async () => {
  await transporter.verify()
  console.log('SMTP mailer ready')
})
