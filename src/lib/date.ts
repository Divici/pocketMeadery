export function formatDateMMDDYYYY(ms: number): string {
  const d = new Date(ms);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const y = d.getFullYear();
  return `${m.toString().padStart(2, '0')}/${day
    .toString()
    .padStart(2, '0')}/${y}`;
}

export function parseDateMMDDYYYY(input: string): number | null {
  const match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, m, day, y] = match;
  const month = parseInt(m, 10) - 1;
  const parsed = new Date(parseInt(y, 10), month, parseInt(day, 10));
  if (isNaN(parsed.getTime())) return null;
  return parsed.getTime();
}
