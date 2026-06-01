/**
 * Formats UZS amounts with Uzbek spacing and suffix.
 */
export function formatCurrency(amount: number): string {
  return `${Math.round(amount).toLocaleString('uz-UZ')} so'm`;
}
