import { getProducts } from '~/api/products'
import type { Product } from '~~/shared/types'

export default function () {
  
  const products = useState<Product[]>('products', () => [])
  
  async function loadProducts () {
    const { selectedOrganizationId } = useOrganization()
    if (selectedOrganizationId.value) {
      const result = await getProducts(selectedOrganizationId.value)
      if (result?.products) {
        products.value = result.products
      }
      return
    }
    products.value = []
  }

  loadProducts()

  return { products, loadProducts }
}