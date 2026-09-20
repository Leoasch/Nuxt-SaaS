// Deterministic PRNG (mulberry32) so every run produces the same people, prices and sales pattern.
let state = 20260919

export function random () {
  state = (state + 0x6D2B79F5) >>> 0
  let t = state
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function int (min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1))
}

export function chance (probability: number) {
  return random() < probability
}

export function pick<T> (items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]!
}

export function weightedPick<T> (items: readonly T[], weight: (item: T, index: number) => number): T {
  const weights = items.map(weight)
  let roll = random() * weights.reduce((sum, w) => sum + w, 0)

  for (const [index, item] of items.entries()) {
    roll -= weights[index]!

    if (roll < 0) {
      return item
    }
  }

  return items[items.length - 1]!
}

export function shuffle<T> (items: readonly T[]): T[] {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!]
  }

  return result
}

export const round2 = (value: number) => Math.round(value * 100) / 100
