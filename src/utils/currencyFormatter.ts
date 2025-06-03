
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
  }).format(amount).replace('KES', 'KSh');
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
  const formatted = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  if (currency === 'KES') {
    return formatted.replace('KES', 'KSh');
  }
  
  return formatted;
};

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - The currency code (e.g., 'KES', 'USD')
 * @returns The currency symbol
 */
export const getCurrencySymbol = (currencyCode: string = 'KES'): string => {
  if (currencyCode === 'KES') {
    return 'KSh';
  }
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
    .formatToParts(0)
    .find(part => part.type === 'currency')?.value || 'KSh';
};
