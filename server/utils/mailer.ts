import nodemailer from 'nodemailer'

const config = useRuntimeConfig()

export const transporter = nodemailer.createTransport({
  host: config.mailHost,
  port: config.mailPort,
  secure: config.mailSecure,
  auth: config.mailUser ? { user: config.mailUser, pass: config.mailPassword } : undefined
})

export async function sendMail (to: string, content: { subject: string, html: string, text: string }) {
  await transporter.sendMail({ from: config.mailFrom, to, ...content })
}
