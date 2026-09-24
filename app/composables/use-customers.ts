import { getCustomers } from '~/api/customers'
import type { Customer, PagingMetadata } from '~~/shared/types'

export default function () {
  
  const customers = useState<Customer[]>('customers', () => [])

  const paging = useState<PagingMetadata>('customersPaging', () => ({
    index: 0,
    limit: 24,
    count: 0,
    pages: 0
  }))
  
  async function loadCustomers () {
    const { selectedOrganizationId } = useOrganization()
    if (selectedOrganizationId.value) {
      const { index, limit } = paging.value
      const result = await getCustomers(selectedOrganizationId.value, { index, limit })
      if (result?.customers) {
        customers.value = result.customers
      }
      if (result?.page) {
        paging.value = result.page

        if (result.customers.length === 0 && result.page.count > 0) {
          paging.value.index = (result.page.pages - 1) * result.page.limit
        }
      }
      return
    }
    customers.value = []
  }

  return { customers, loadCustomers, paging }
}