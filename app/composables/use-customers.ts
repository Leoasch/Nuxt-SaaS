import { getCustomers } from '~/api/customers'
import type { Customer } from '~~/shared/types'

export default function () {
  
  const customers = useState<Customer[]>('customers', () => [])
  
  async function loadCustomers () {
    const { selectedOrganizationId } = useOrganization()
    if (selectedOrganizationId.value) {
      const result = await getCustomers(selectedOrganizationId.value)
      if (result?.customers) {
        customers.value = result.customers
      }
      return
    }
    customers.value = []
  }

  loadCustomers()

  return { customers, loadCustomers }
}