import type { Role } from '~~/shared/types'
import { chance, int, pick } from './random'

export const SEED_EMAIL_DOMAIN = 'seed.example.com'
export const SEED_PASSWORD = 'Password123!'

export type OrgKey = 'tech' | 'home' | 'fashion'

export interface SeedUserDef {
  key: string
  name: string
  email: string
}

export interface SeedOrgDef {
  key: OrgKey
  name: string
  categories: string[]
  productCount: number
  salesPerDay: number
  customerCount: number
}

export interface SeedMembershipDef {
  org: OrgKey
  user: string
  role: Role
  pending?: boolean
}

const user = (key: string, name: string): SeedUserDef => ({ key, name, email: `${key}@${SEED_EMAIL_DOMAIN}` })

export const SEED_USERS: SeedUserDef[] = [
  user('ana', 'Ana Souza'),
  user('bruno', 'Bruno Lima'),
  user('carla', 'Carla Mendes'),
  user('diego', 'Diego Ferreira'),
  user('elisa', 'Elisa Rocha'),
  user('felipe', 'Felipe Costa'),
  user('gabriela', 'Gabriela Alves'),
  user('henrique', 'Henrique Martins'),
  user('julia', 'Julia Barbosa'),
  user('lucas', 'Lucas Pereira')
]

export const SEED_ORGS: SeedOrgDef[] = [
  {
    key: 'tech',
    name: 'TechNova Eletrônicos',
    categories: ['smartphones', 'laptops', 'tablets', 'mobile-accessories'],
    productCount: 30,
    salesPerDay: 9,
    customerCount: 25
  },
  {
    key: 'home',
    name: 'Casa & Cozinha Bela Vista',
    categories: ['furniture', 'home-decoration', 'kitchen-accessories'],
    productCount: 30,
    salesPerDay: 12,
    customerCount: 25
  },
  {
    key: 'fashion',
    name: 'Moda Urbana Boutique',
    categories: [
      'mens-shirts', 'mens-shoes', 'womens-dresses', 'womens-shoes', 'tops',
      'womens-bags', 'mens-watches', 'womens-watches', 'sunglasses', 'womens-jewellery'
    ],
    productCount: 30,
    salesPerDay: 14,
    customerCount: 25
  }
]

// Exactly one OWNER per organization (unique partial index). Julia has two pending invites and
// Lucas belongs to no organization, to exercise the invites widget and the empty state.
export const SEED_MEMBERSHIPS: SeedMembershipDef[] = [
  { org: 'tech', user: 'ana', role: 'OWNER' },
  { org: 'tech', user: 'diego', role: 'ADMIN' },
  { org: 'tech', user: 'elisa', role: 'MANAGER' },
  { org: 'tech', user: 'felipe', role: 'EMPLOYEE' },
  { org: 'tech', user: 'julia', role: 'MANAGER', pending: true },

  { org: 'home', user: 'bruno', role: 'OWNER' },
  { org: 'home', user: 'gabriela', role: 'ADMIN' },
  { org: 'home', user: 'diego', role: 'MANAGER' },
  { org: 'home', user: 'felipe', role: 'EMPLOYEE' },
  { org: 'home', user: 'henrique', role: 'EMPLOYEE' },

  { org: 'fashion', user: 'carla', role: 'OWNER' },
  { org: 'fashion', user: 'elisa', role: 'ADMIN' },
  { org: 'fashion', user: 'gabriela', role: 'MANAGER' },
  { org: 'fashion', user: 'henrique', role: 'EMPLOYEE' },
  { org: 'fashion', user: 'julia', role: 'EMPLOYEE', pending: true }
]

const FIRST_NAMES = [
  'Miguel', 'Arthur', 'Heitor', 'Theo', 'Davi', 'Gabriel', 'Bernardo', 'Samuel', 'João', 'Pedro',
  'Rafael', 'Guilherme', 'Enzo', 'Nicolas', 'Vinícius', 'Leonardo', 'Matheus', 'Caio', 'Otávio', 'Renato',
  'Helena', 'Alice', 'Laura', 'Maria', 'Sophia', 'Manuela', 'Valentina', 'Isabella', 'Heloísa', 'Beatriz',
  'Luiza', 'Júlia', 'Mariana', 'Larissa', 'Camila', 'Fernanda', 'Patrícia', 'Aline', 'Renata', 'Bianca'
]

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Ribeiro', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias',
  'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos'
]

const AREA_CODES = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '19']

const digits = (count: number) => Array.from({ length: count }, () => int(0, 9))

function checkDigit (base: number[], weights: number[]) {
  const sum = base.reduce((acc, digit, index) => acc + digit * weights[index]!, 0)
  const rest = sum % 11

  return rest < 2 ? 0 : 11 - rest
}

export function generateCpf () {
  const base = digits(9)
  const d1 = checkDigit(base, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = checkDigit([...base, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  const all = [...base, d1, d2].join('')

  return `${all.slice(0, 3)}.${all.slice(3, 6)}.${all.slice(6, 9)}-${all.slice(9)}`
}

export function generateCnpj () {
  const base = [...digits(8), 0, 0, 0, 1]
  const d1 = checkDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = checkDigit([...base, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const all = [...base, d1, d2].join('')

  return `${all.slice(0, 2)}.${all.slice(2, 5)}.${all.slice(5, 8)}/${all.slice(8, 12)}-${all.slice(12)}`
}

const slug = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export interface GeneratedCustomer {
  name: string
  email: string | null
  phone: string | null
  document: string | null
}

// Some customers miss email/phone/document on purpose: those fields are nullable in the app.
export function generateCustomers (count: number): GeneratedCustomer[] {
  const seen = new Set<string>()
  const customers: GeneratedCustomer[] = []

  while (customers.length < count) {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const name = `${first} ${last}`

    if (seen.has(name)) {
      continue
    }

    seen.add(name)

    customers.push({
      name,
      email: chance(0.85) ? `${slug(first)}.${slug(last)}${int(1, 99)}@example.com` : null,
      phone: chance(0.9) ? `(${pick(AREA_CODES)}) 9${int(1000, 9999)}-${int(1000, 9999)}` : null,
      document: chance(0.9) ? generateCpf() : null
    })
  }

  return customers
}
