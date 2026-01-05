export function normalizeDateRange(start: Date, end: Date): [Date, Date] {
  const startUtc = new Date(start);
  const endUtc = new Date(end);

  if (Number.isNaN(startUtc.getTime()) || Number.isNaN(endUtc.getTime())) {
    throw new Error('Invalid date range provided.');
  }

  if (startUtc > endUtc) {
    return [endUtc, startUtc];
  }

  return [startUtc, endUtc];
}
