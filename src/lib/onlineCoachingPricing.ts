/** Online coaching subscription prices (EUR) */
export const ONLINE_COACHING_MONTHLY_EUR = 24.95;

export const ONLINE_COACHING_YEARLY_DISCOUNT = 0.2;

export const ONLINE_COACHING_YEARLY_EUR = Math.round(
  ONLINE_COACHING_MONTHLY_EUR * 12 * (1 - ONLINE_COACHING_YEARLY_DISCOUNT) * 100,
) / 100;

export const ONLINE_COACHING_YEARLY_PER_MONTH_EUR = Math.round(
  ONLINE_COACHING_MONTHLY_EUR * (1 - ONLINE_COACHING_YEARLY_DISCOUNT) * 100,
) / 100;

export function formatEur(amount: number): string {
  return amount.toLocaleString('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
