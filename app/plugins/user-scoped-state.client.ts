const USER_SCOPED_STATE = [
  'organizations',
  'organizationPaging',
  'selectedOrganization',
  'selectedOrganizationLoadingId',
  'products',
  'productsPaging',
  'customers',
  'customersPaging',
  'sales',
  'salesPaging',
  'stock',
  'stockPaging',
  'productFilter'
]

export default defineNuxtPlugin(() => {
  const { user } = useUserSession()

  watch(() => user.value?.id, (newId, oldId) => {
    if (oldId && newId !== oldId) {
      clearNuxtState(USER_SCOPED_STATE, { reset: true })
    }
  })
})
