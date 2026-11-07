export function accountingAmount(value: unknown, blankZero = false): string {
  if (value === null || value === undefined || value === '') return '';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  if (blankZero && amount === 0) return '';
  const text = Math.abs(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount < 0 ? `(${text})` : text;
}

export function accountingDate(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-AR');
}
