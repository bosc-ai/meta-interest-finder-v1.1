export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }
  try {
    const url = process.env.GAS_WEBAPP_URL || process.env.NEXT_PUBLIC_GAS_WEBAPP_URL
    if (!url) return res.status(500).json({ ok: false, error: 'Missing GAS_WEBAPP_URL' })

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // server-side, so no CORS issues
      body: JSON.stringify(req.body),
    })

    const data = await r.json().catch(() => ({ ok: false, error: 'Invalid JSON from Apps Script' }))
    if (!r.ok || data.ok === false) {
      return res.status(500).json({ ok: false, error: data.error || 'Apps Script failed' })
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) })
  }
}
