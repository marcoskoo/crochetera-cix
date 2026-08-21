// Tasas de cambio aproximadas (en producción usar API real)
export const EXCHANGE_RATES: Record<string, number> = {
  PEN: 1,
  USD: 0.27, // 1 PEN = 0.27 USD aprox
  EUR: 0.25, // 1 PEN = 0.25 EUR aprox
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: 'S/',
  USD: '$',
  EUR: '€',
}

export function convertPrice(amountPEN: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency] || 1
  return amountPEN * rate
}

export function formatPriceMulti(amountPEN: number, currency: string): string {
  const converted = convertPrice(amountPEN, currency)
  const symbol = CURRENCY_SYMBOLS[currency] || 'S/'
  return `${symbol} ${converted.toFixed(2)}`
}
