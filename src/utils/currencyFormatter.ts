
/**
 * Format a number as Kenyan Shilling currency
 * @param amount - The amount to format
 * @returns The formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number as Kenyan Shilling currency without the symbol
 * @param amount - The amount to format
 * @returns The formatted number string without currency symbol
 */
export const formatCurrencyValue = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number with a specified currency
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'KES', 'USD')
 * @returns The formatted currency string
 */
export const formatWithCurrency = (amount: number, currency: string = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
