
type UseAuth = {
  login: (login: string, password: string) => Promise<void>
}

export default function () {
  const auth = ref<UseAuth>({
    async login (login: string, password: string) {
      
    },
  })
  return useState('auth', () => auth)
}