import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { mapPool } from './pool'

// DummyJSON ships real product photos that match each product's title, plus SKUs and barcodes.
const CATALOG_URL = 'https://dummyjson.com/products?limit=0&select=title,category,brand,sku,price,images,meta'
const CACHE_DIR = resolve(process.cwd(), '.data/seed-cache')
const CATALOG_FILE = join(CACHE_DIR, 'catalog.json')
const IMAGE_DIR = join(CACHE_DIR, 'images')

const MAX_IMAGES_PER_PRODUCT = 3
const DOWNLOAD_CONCURRENCY = 8
const DOWNLOAD_ATTEMPTS = 3
const USD_TO_BRL = 5.5

// Same set the upload endpoints accept.
const EXTENSION_BY_MIME: Record<string, string> = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/avif': 'avif'
}

const MIME_BY_EXTENSION = Object.fromEntries(Object.entries(EXTENSION_BY_MIME).map(([mime, ext]) => [ext, mime]))

interface RawProduct {
  id: number
  title: string
  category: string
  sku: string
  price: number
  images: string[]
  meta?: { barcode?: string }
}

export interface CatalogImage {
  path: string
  mime: string
  size: number
}

export interface CatalogProduct {
  title: string
  category: string
  sku: string
  barcode: string | null
  salePrice: number
  images: CatalogImage[]
}

export const imageStats = { cached: 0, downloaded: 0, failed: 0 }

async function fetchWithRetry (url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= DOWNLOAD_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error
      await new Promise(done => setTimeout(done, attempt * 400))
    }
  }

  throw lastError
}

export async function loadCatalog (): Promise<RawProduct[]> {
  if (existsSync(CATALOG_FILE)) {
    return JSON.parse(await readFile(CATALOG_FILE, 'utf8')).products
  }

  let data: { products: RawProduct[] }

  try {
    data = await (await fetchWithRetry(CATALOG_URL)).json()
  } catch (error) {
    throw new Error(
      `Could not download the product catalog from ${CATALOG_URL} (${(error as Error).message}). ` +
      'The first seed run needs internet access; later runs use the cache in .data/seed-cache.',
      { cause: error }
    )
  }

  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(CATALOG_FILE, JSON.stringify(data))

  return data.products
}

async function fetchImage (url: string): Promise<CatalogImage | null> {
  const hash = createHash('sha1').update(url).digest('hex')

  for (const [extension, mime] of Object.entries(MIME_BY_EXTENSION)) {
    const path = join(IMAGE_DIR, `${hash}.${extension}`)

    if (existsSync(path)) {
      imageStats.cached++

      return { path, mime, size: (await stat(path)).size }
    }
  }

  try {
    const response = await fetchWithRetry(url)
    const mime = response.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
    const extension = EXTENSION_BY_MIME[mime]

    if (!extension) {
      throw new Error(`unsupported content type "${mime}"`)
    }

    const data = Buffer.from(await response.arrayBuffer())
    const path = join(IMAGE_DIR, `${hash}.${extension}`)

    await mkdir(IMAGE_DIR, { recursive: true })
    await writeFile(path, data)
    imageStats.downloaded++

    return { path, mime, size: data.length }
  } catch (error) {
    imageStats.failed++
    console.warn(`  ! could not download ${url}: ${(error as Error).message}`)

    return null
  }
}

// USD -> BRL with retail-style pricing (…,90).
function toBrlPrice (usd: number) {
  const reais = Math.max(5, Math.round(usd * USD_TO_BRL))

  return Math.round((reais - 0.1) * 100) / 100
}

// Takes products from each category in turn so an organization gets a varied catalog.
function interleave (groups: RawProduct[][]) {
  const result: RawProduct[] = []
  const longest = Math.max(0, ...groups.map(group => group.length))

  for (let i = 0; i < longest; i++) {
    for (const group of groups) {
      if (group[i]) {
        result.push(group[i]!)
      }
    }
  }

  return result
}

// Returns up to `target` products (with their photos already on disk) for the given categories.
// A product whose photos can't be fetched is skipped, never seeded without / with wrong images.
export async function selectProducts (catalog: RawProduct[], categories: string[], target: number): Promise<CatalogProduct[]> {
  const queue = interleave(categories.map(category => catalog.filter(product => product.category === category)))
  const selected: CatalogProduct[] = []

  while (selected.length < target && queue.length > 0) {
    const batch = queue.splice(0, target - selected.length)

    const downloaded = await mapPool(batch, DOWNLOAD_CONCURRENCY, async (product) => {
      const images = await mapPool(product.images.slice(0, MAX_IMAGES_PER_PRODUCT), MAX_IMAGES_PER_PRODUCT, fetchImage)

      return { product, images: images.filter((image): image is CatalogImage => image !== null) }
    })

    for (const { product, images } of downloaded) {
      if (images.length === 0) {
        console.warn(`  ! skipping "${product.title}": no image could be fetched`)
        continue
      }

      selected.push({
        title: product.title,
        category: product.category,
        sku: product.sku,
        barcode: product.meta?.barcode ?? null,
        salePrice: toBrlPrice(product.price),
        images
      })
    }
  }

  return selected
}
