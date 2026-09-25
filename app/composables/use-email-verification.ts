import { sendEmailVerification } from '~/api/auth'
import { getUser } from '~/api/users'

export default function useEmailVerification () {
  const { toastApiError } = useApiError()

  const email = ref<string | null>(null)
  const verified = ref<boolean | null>(null)
  const sending = ref(false)
  const sent = ref(false)

  async function load () {
    const { user } = await getUser()
    email.value = user.email
    verified.value = !!user.emailVerified
  }

  async function send () {
    sending.value = true
    try {
      await sendEmailVerification()
      sent.value = true
    } catch (error: any) {
      if (error?.data?.data?.code === 'EMAIL_VERIFICATION.ALREADY_VERIFIED') {
        verified.value = true
        return
      }
      toastApiError(error)
    } finally {
      sending.value = false
    }
  }

  return { email, verified, sending, sent, load, send }
}
