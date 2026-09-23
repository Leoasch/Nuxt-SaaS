import { getOrganizations } from '~/api/organization'
import type { Organization } from '~~/shared/types'

export default function () {

  const paging = useState('organizationPaging', () => ({
    index: 0,
    limit: 16,
    count: 0,
    pages: 0
  }))

  const organizations = useState<Organization[]>('organizations', () => [])
  const selectedOrganization = useState<Organization | null>('selectedOrganization', () => null)

  const { user } = useUserSession()
  const selection = useCookie<{ userId: string, organizationId: string } | null>('organizationSelection', { default: () => null })
  const selectedOrganizationId = computed<string | null>({
    get: () => {
      const current = selection.value
      return current && user.value && current.userId === user.value.id ? current.organizationId : null
    },
    set: (organizationId) => {
      selection.value = organizationId && user.value ? { userId: user.value.id, organizationId } : null
    }
  })
  const loadingOrganizationId = useState<string | null>('selectedOrganizationLoadingId', () => null)

  async function fetchOrganizations () {
    const result = await getOrganizations(paging.value)
    if (result?.organizations) {
      organizations.value = result.organizations
    }
    if (result.page) {
      paging.value = result.page
    }
  }

  async function loadSelectedOrganization (force = false) {
    const id = selectedOrganizationId.value

    if (!id) {
      selectedOrganization.value = null
      return
    }

    if (import.meta.server || (!force && (selectedOrganization.value?.id === id || loadingOrganizationId.value === id))) {
      return
    }

    loadingOrganizationId.value = id

    try {
      const result = await getOrganizations(id)

      if (selectedOrganizationId.value === id) {
        selectedOrganization.value = result.organization.is_member ? result.organization : null
      }
    } catch {
      if (selectedOrganizationId.value === id) {
        selectedOrganization.value = null
      }
    } finally {
      if (loadingOrganizationId.value === id) {
        loadingOrganizationId.value = null
      }
    }
  }

  async function loadOrganizations () {
    await fetchOrganizations()
    await loadSelectedOrganization(true)
  }

  fetchOrganizations().catch(() => {})
  loadSelectedOrganization()

  if (getCurrentInstance()) {
    watch(selectedOrganizationId, () => loadSelectedOrganization())
  }

  return { organizations, selectedOrganizationId, selectedOrganization, loadOrganizations, loadSelectedOrganization, paging }
}
