
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
