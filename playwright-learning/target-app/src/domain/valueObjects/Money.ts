export interface Money {
  amount: number;
  currency: 'JPY' | 'USD';
}

export function createMoney(amount: number, currency: 'JPY' | 'USD' = 'JPY'): Money {
  if (amount < 0) {
    throw new Error('Money amount cannot be negative');
  }
  return { amount, currency };
}

export function formatMoney(money: Money): string {
  if (money.currency === 'JPY') {
    return `¥${money.amount.toLocaleString()}`;
  }
  return `$${money.amount.toFixed(2)}`;
}
