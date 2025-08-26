
export function toCSV(rows: any[]) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const r of rows) lines.push(headers.map(h => JSON.stringify(r[h] ?? '').replace(/^"|"$/g,'"')).join(','))
  return lines.join('\n')
}
export async function copyToClipboard(text: string) {
  try { await navigator.clipboard.writeText(text); return true }
  catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); return true }
}
export const countries = [
  { code: 'ALL', name: 'All Countries' }, { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' }, { code: 'AE', name: 'United Arab Emirates' }, { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' }, { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' }, { code: 'SG', name: 'Singapore' }, { code: 'SA', name: 'Saudi Arabia' },
]
