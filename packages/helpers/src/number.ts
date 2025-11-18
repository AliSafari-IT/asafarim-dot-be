// packages/helpers/src/number.ts

/**
 * Format a number with thousand separators and optional decimal places.
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - Locale for formatting (default: 'en-US')
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
  locale = "en-US"
): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as currency.
 * @param value - The number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 */
export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString(locale, {
    style: "currency",
    currency,
  });
}

/**
 * Format a number as a percentage.
 * @param value - The decimal value (e.g., 0.75 for 75%)
 * @param decimals - Number of decimal places (default: 0)
 */
export function formatPercent(
  value: number | null | undefined,
  decimals = 0
): string {
  if (value === null || value === undefined) return "-";
  return (value * 100).toFixed(decimals) + "%";
}

/**
 * Clamp a number between min and max values.
 */
export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Round a number to a specified number of decimal places.
 */
export function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
