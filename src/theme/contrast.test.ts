import { contrastRatio, meetsAA, TOKENS } from './contrast'

test('white against the page background is not usable for body text', () => {
  expect(meetsAA('#FFFFFF', TOKENS.bg)).toBe(false)
})

test('ink on the glass surface clears AA for body text', () => {
  expect(contrastRatio(TOKENS.ink, TOKENS.glass)).toBeGreaterThanOrEqual(4.5)
  expect(contrastRatio(TOKENS['ink-2'], TOKENS.glass)).toBeGreaterThanOrEqual(4.5)
})

test('tertiary ink clears AA at body size', () => {
  expect(contrastRatio(TOKENS['ink-3'], TOKENS.glass)).toBeGreaterThanOrEqual(4.5)
})

test('quaternary ink clears 3:1 for large text but is rejected for body text', () => {
  const ratio = contrastRatio(TOKENS['ink-4'], TOKENS.glass)
  expect(ratio).toBeGreaterThanOrEqual(3)
  expect(ratio).toBeLessThan(4.5)
  expect(meetsAA(TOKENS['ink-4'], TOKENS.glass, true)).toBe(true)
  expect(meetsAA(TOKENS['ink-4'], TOKENS.glass, false)).toBe(false)
})

test('primary on-glass text clears AA', () => {
  expect(contrastRatio(TOKENS['primary-600'], TOKENS.glass)).toBeGreaterThanOrEqual(4.5)
})
