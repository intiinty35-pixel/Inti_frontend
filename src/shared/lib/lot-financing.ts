export function monthlyInstallment(amount: number, initial: number, months: number, monthlyPercent: number) {
  if (![amount, initial, months, monthlyPercent].every(Number.isFinite) || amount < initial || initial < 0 || months < 1 || !Number.isInteger(months) || monthlyPercent < 0) return 0;
  const balance = amount - initial;
  const rate = monthlyPercent / 100;
  const payment = rate === 0 ? balance / months : balance * rate / -Math.expm1(-months * Math.log1p(rate));
  return Math.round(payment * 100) / 100;
}
