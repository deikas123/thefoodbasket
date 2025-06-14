
export const formatCurrency = (amount: number): string => {
  // Use a more explicit approach to ensure KSH is always displayed
  return `KSH ${amount.toLocaleString('en-KE', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  })}`;
};

// Alternative simple formatter for cases where Intl might not work as expected
export const formatCurrencySimple = (amount: number): string => {
  return `KSH ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
