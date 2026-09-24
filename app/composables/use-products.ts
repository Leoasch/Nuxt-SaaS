import { getProducts } from '~/api/products'
import type { Product } from '~~/shared/types'

export default function () {
  
  const products = useState<Product[]>('products', () => [])
  
  const paging = useState('productsPaging', () => ({
    index: 0,
    limit: 12,
    count: 0,
    pages: 0
  }))

  async function loadProducts () {
    const { selectedOrganizationId } = useOrganization()
    if (selectedOrganizationId.value) {
      const result = await getProducts(selectedOrganizationId.value, paging.value)
      if (result?.products) {
        products.value = result.products
      }
      if (result.page) {
        paging.value = result.page
      }
      return
    }
    products.value = []
  }

  return { products, loadProducts, paging }
}