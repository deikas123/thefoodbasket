
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('en-KE', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0
  })}sh`;
};

// Alternative simple formatter for cases where Intl might not work as expected
export const formatCurrencySimple = (amount: number): string => {
  return `${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}sh`;
};
