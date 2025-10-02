export function formatIsoDate(value: string, locales = 'en-US') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locales, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export function formatNumber(value: number, locales = 'en-US') {
  return new Intl.NumberFormat(locales).format(value);
}
