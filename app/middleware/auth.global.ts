export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const isAuth = to.path.startsWith('/auth')

  if (!isAuth && !loggedIn.value) {
    return navigateTo('/auth/login')
  }

  if (isAuth && loggedIn.value) {
    return navigateTo('/')
  }
})