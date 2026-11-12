/** Formato de pesos colombianos sin depender de Intl (Hermes en Android puede no traer todos los locales). */
export function formatCOP(value: number, opts: { decimals?: number } = {}) {
  const decimals = opts.decimals ?? 0;
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '-' : ''}$${withDots}${dec ? ',' + dec : ''}`;
}

export function formatNumber(value: number, decimals = 0) {
  return formatCOP(value, { decimals }).replace('$', '');
}

export function formatMillions(m: number) {
  return `$${formatNumber(m)} M`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDayLabel(d: Date) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[d.getDay()];
}

export function uid(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}
