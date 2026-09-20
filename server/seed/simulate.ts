import type { InferCreationAttributes, Optional } from 'sequelize'
import type { Sale } from '~~/server/database/models/Sale'
import type { SaleItem } from '~~/server/database/models/SaleItem'
import type { StockMovement } from '~~/server/database/models/StockMovements'
import type { Role } from '~~/shared/types'
import { hasMinimumRole } from '~~/shared/utils/roles'
import { chance, int, pick, random, round2, shuffle, weightedPick } from './random'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Store hours are 09:00-19:59 in Sao Paulo (UTC-3), i.e. 12:00-22:59 UTC. Keeping every sale inside
// the same UTC day makes the UTC day buckets used by /sales/revenue match the local days.
const SALE_HOUR_WEIGHTS: Record<number, number> = { 12: 1, 13: 2, 14: 3, 15: 4, 16: 3, 17: 2, 18: 2, 19: 3, 20: 4, 21: 3, 22: 1 }
const SALE_HOURS = Object.keys(SALE_HOUR_WEIGHTS).map(Number)
// Restocks arrive before the store opens (08:00-08:59 BRT) so the ledger never dips below zero.
const RESTOCK_HOUR = 11

const WEEKDAY_FACTOR = [0.7, 0.9, 0.9, 1, 1, 1.25, 1.5] // Sunday..Saturday

const PAYMENT_METHODS = [
  { method: 'pix', weight: 35 },
  { method: 'credit_card', weight: 30 },
  { method: 'debit_card', weight: 20 },
  { method: 'cash', weight: 12 },
  { method: 'other', weight: 3 }
]

const ROLE_WEIGHT: Record<Role, number> = { OWNER: 1, ADMIN: 1.5, MANAGER: 2, EMPLOYEE: 3 }
const ADJUSTMENT_LOSS_REASONS = ['Damaged item', 'Expired / unsellable', 'Inventory count correction', null]

// Most models don't declare their timestamp attributes; Sequelize still honors explicit values on bulkCreate.
export type Stamped<T> = T & { createdAt: Date, updatedAt: Date }

export interface SimMember {
  user_id: string
  role: Role
  acceptedAt: Date
}

export interface SimCustomer {
  id: string
  createdAt: Date
}

export interface SimProduct {
  id: string
  sale_price: number
  minimum_stock: number
  initial_stock: number
}

export interface SimulationInput {
  organization_id: string
  startsAt: Date
  now: Date
  days: number
  salesPerDay: number
  members: SimMember[]
  customers: SimCustomer[]
  products: SimProduct[]
}

// Movements and items get their id from the model's defaultValue.
export interface SimulationResult {
  stockMovements: Stamped<Optional<InferCreationAttributes<StockMovement>, 'id'>>[]
  sales: InferCreationAttributes<Sale>[]
  saleItems: Stamped<Optional<InferCreationAttributes<SaleItem>, 'id'>>[]
  finalStock: Map<string, number>
}

type SimEvent =
  | { at: number, kind: 'sale' }
  | { at: number, kind: 'adjust' }
  | { at: number, kind: 'restock', product_id: string, quantity: number, user_id: string }
  | { at: number, kind: 'cancel', sale_id: string, user_id: string, items: { product_id: string, quantity: number }[] }

// Cheap products are stocked deep, expensive ones shallow.
export function initialStockFor (salePrice: number) {
  if (salePrice < 100) {
    return int(80, 200)
  }

  if (salePrice < 500) {
    return int(40, 100)
  }

  if (salePrice < 2000) {
    return int(15, 40)
  }

  return int(5, 20)
}

export function minimumStockFor (initialStock: number) {
  return Math.min(20, Math.max(3, Math.round(initialStock * 0.2)))
}

export function simulate (input: SimulationInput): SimulationResult {
  const { organization_id, products } = input
  const nowMs = input.now.getTime()
  const customers = [...input.customers].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  const stock = new Map<string, number>()
  const stockMovements: SimulationResult['stockMovements'] = []
  const sales: SimulationResult['sales'] = []
  const saleItems: SimulationResult['saleItems'] = []

  // Zipf-like popularity: a few products sell a lot, most sell moderately, and cheaper ones sell more.
  const weight = new Map(shuffle(products).map((product, index) => [
    product.id,
    (1 / Math.pow(index + 1, 0.8)) / (1 + product.sale_price / 1500)
  ]))
  // ~10% of the products are never restocked, so some of them end the period under their minimum.
  const neverRestocked = new Set(shuffle(products).slice(0, Math.max(1, Math.round(products.length * 0.1))).map(p => p.id))
  const restockScheduled = new Set<string>()

  const membersAt = (at: number) => input.members.filter(member => member.acceptedAt.getTime() <= at)
  const managerAt = (at: number) => pick(membersAt(at).filter(member => hasMinimumRole(member.role, 'MANAGER')))
  const cashierAt = (at: number) => weightedPick(membersAt(at), member => ROLE_WEIGHT[member.role])

  function move (at: number, product_id: string, quantity: number, reason: string | null, user_id: string | null) {
    stock.set(product_id, (stock.get(product_id) ?? 0) + quantity)
    stockMovements.push({
      organization_id,
      user_id,
      product_id,
      quantity,
      reason,
      createdAt: new Date(at),
      updatedAt: new Date(at)
    })
  }

  // Day 0: the owner registers the initial stock.
  const owner = input.members.find(member => member.role === 'OWNER')!

  for (const product of products) {
    move(input.startsAt.getTime() + int(0, 90) * MINUTE, product.id, product.initial_stock, 'Initial stock', owner.user_id)
  }

  let pending: SimEvent[] = []
  let queue: SimEvent[] = []
  let dayEnd = 0

  // Events inside the current day go to the (time ordered) queue, later ones wait in `pending`.
  function schedule (event: SimEvent) {
    if (event.at > nowMs) {
      return
    }

    if (event.at >= dayEnd) {
      pending.push(event)
      return
    }

    const index = queue.findIndex(other => other.at > event.at)
    queue.splice(index === -1 ? queue.length : index, 0, event)
  }

  function maybeRestock (product: SimProduct, at: number) {
    if ((stock.get(product.id) ?? 0) > product.minimum_stock || neverRestocked.has(product.id) || restockScheduled.has(product.id)) {
      return
    }

    const dayStart = at - (at % DAY)
    const deliveryAt = dayStart + int(1, 4) * DAY + RESTOCK_HOUR * HOUR + int(0, 59) * MINUTE

    if (deliveryAt > nowMs) {
      return
    }

    restockScheduled.add(product.id)
    schedule({
      at: deliveryAt,
      kind: 'restock',
      product_id: product.id,
      quantity: Math.round(product.initial_stock * (0.8 + random() * 0.7)),
      user_id: managerAt(deliveryAt).user_id
    })
  }

  function sell (at: number) {
    const inStock = products.filter(product => (stock.get(product.id) ?? 0) > 0)

    if (inStock.length === 0) {
      return
    }

    const chosen = new Set<string>()
    const lines: { product: SimProduct, quantity: number, unit_price: number, total: number }[] = []
    const lineCount = weightedPick([1, 2, 3, 4], (_, index) => [55, 28, 12, 5][index]!)

    for (let i = 0; i < lineCount; i++) {
      const candidates = inStock.filter(product => !chosen.has(product.id))

      if (candidates.length === 0) {
        break
      }

      const product = weightedPick(candidates, candidate => weight.get(candidate.id)!)
      const quantity = Math.min(weightedPick([1, 2, 3], (_, index) => [75, 18, 7][index]!), stock.get(product.id)!)
      // ~8% of the lines are sold with a manual discount, like the unit_price override of the real endpoint.
      const unit_price = chance(0.08) ? round2(product.sale_price * (1 - int(5, 15) / 100)) : product.sale_price

      chosen.add(product.id)
      lines.push({ product, quantity, unit_price, total: round2(unit_price * quantity) })
    }

    const cashier = cashierAt(at)
    const eligibleCustomers = customers.filter(customer => customer.createdAt.getTime() <= at)
    const customer = eligibleCustomers.length > 0 && chance(0.6)
      ? weightedPick(eligibleCustomers, (_, index) => 1 / Math.pow(index + 1, 0.5))
      : null

    const saleId = crypto.randomUUID()
    const canceledAtMs = chance(0.04) ? at + int(5, 120) * MINUTE : null
    const canceledAt = canceledAtMs !== null && canceledAtMs <= nowMs ? new Date(canceledAtMs) : null

    sales.push({
      id: saleId,
      organization_id,
      customer_id: customer?.id ?? null,
      user_id: cashier.user_id,
      total: round2(lines.reduce((sum, line) => sum + line.total, 0)),
      payment_method: weightedPick(PAYMENT_METHODS, entry => entry.weight).method,
      canceled_at: canceledAt,
      createdAt: new Date(at),
      updatedAt: canceledAt ?? new Date(at)
    })

    for (const line of lines) {
      saleItems.push({
        sale_id: saleId,
        product_id: line.product.id,
        quantity: line.quantity,
        unit_price: line.unit_price,
        original_unit_price: line.product.sale_price,
        total: line.total,
        createdAt: new Date(at),
        updatedAt: new Date(at)
      })

      move(at, line.product.id, -line.quantity, `Sale ${saleId}`, cashier.user_id)
      maybeRestock(line.product, at)
    }

    if (canceledAt) {
      schedule({
        at: canceledAt.getTime(),
        kind: 'cancel',
        sale_id: saleId,
        user_id: managerAt(canceledAt.getTime()).user_id,
        items: lines.map(line => ({ product_id: line.product.id, quantity: line.quantity }))
      })
    }
  }

  function adjust (at: number) {
    const candidates = products.filter(product => (stock.get(product.id) ?? 0) >= 4)

    if (candidates.length === 0) {
      return
    }

    const product = pick(candidates)
    const user_id = managerAt(at).user_id

    if (chance(0.75)) {
      move(at, product.id, -int(1, 3), pick(ADJUSTMENT_LOSS_REASONS), user_id)
    } else {
      move(at, product.id, int(1, 3), 'Inventory count correction', user_id)
    }
  }

  const today = input.now.getTime() - (input.now.getTime() % DAY)

  for (let offset = input.days; offset >= 0; offset--) {
    const dayStart = today - offset * DAY

    dayEnd = dayStart + DAY
    queue = pending.filter(event => event.at < dayEnd)
    pending = pending.filter(event => event.at >= dayEnd)

    const growth = 0.7 + 0.5 * ((input.days - offset) / input.days)
    const saleCount = Math.round(
      input.salesPerDay * WEEKDAY_FACTOR[new Date(dayStart).getUTCDay()]! * growth * (0.75 + random() * 0.5)
    )

    for (let i = 0; i < saleCount; i++) {
      const hour = weightedPick(SALE_HOURS, candidate => SALE_HOUR_WEIGHTS[candidate]!)

      queue.push({ at: dayStart + hour * HOUR + int(0, 59) * MINUTE + int(0, 59) * 1000, kind: 'sale' })
    }

    if (chance(0.09)) {
      queue.push({ at: dayStart + pick(SALE_HOURS) * HOUR + int(0, 59) * MINUTE, kind: 'adjust' })
    }

    queue = queue.filter(event => event.at <= nowMs).sort((a, b) => a.at - b.at)

    while (queue.length > 0) {
      const event = queue.shift()!

      if (event.kind === 'sale') {
        sell(event.at)
      } else if (event.kind === 'adjust') {
        adjust(event.at)
      } else if (event.kind === 'restock') {
        restockScheduled.delete(event.product_id)
        move(event.at, event.product_id, event.quantity, `Supplier restock (PO #${int(1000, 9999)})`, event.user_id)
      } else {
        for (const item of event.items) {
          move(event.at, item.product_id, item.quantity, `Sale ${event.sale_id} canceled`, event.user_id)
        }
      }
    }
  }

  for (const [product_id, quantity] of stock) {
    if (quantity < 0) {
      throw new Error(`Simulation produced negative stock (${quantity}) for product ${product_id}`)
    }
  }

  return { stockMovements, sales, saleItems, finalStock: stock }
}
