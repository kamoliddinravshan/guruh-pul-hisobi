/**
 * Formats UZS amounts with Uzbek spacing and suffix.
 */
export function formatCurrency(amount: number): string {
  return `${Math.round(amount).toLocaleString('uz-UZ').replace(/\u00a0/g, ' ')} so'm`;
}
