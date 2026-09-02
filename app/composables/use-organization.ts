import { getOrganizations } from '~/api/organization'
import type { Organization } from '~~/shared/types'

export default function () {
  
  const organizations = useState<Organization[]>('organizations', () => [])
  const selectedOrganizationId = useCookie<string | null>('selectedOrganizationId', { default: () => null })
  
  const selectedOrganization = computed<Organization | null>(() =>
    organizations.value.find(org => org.id === selectedOrganizationId.value) ?? null
  )
  
  async function loadOrganizations () {
    const result = await getOrganizations()
    if (result?.organizations) {
      organizations.value = result.organizations
    }
  }

  loadOrganizations()

  return { organizations, selectedOrganizationId, selectedOrganization, loadOrganizations }
}