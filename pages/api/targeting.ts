
import { NextApiRequest, NextApiResponse } from 'next'
const { metaFetch } = require('./_server-utils')
const allowed = new Set(['adworkposition','adworkemployer','adeducationmajor','adeducationschool'])
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q = '', type = '', limit = '25' } = req.query
  if (!allowed.has(String(type))) return res.status(400).json({ ok:false, error:'Unsupported type' })
  if (!q || typeof q !== 'string') return res.status(200).json({ ok:true, data: [] })
  const out = await metaFetch('search', { type, q, limit, locale:'en_US' })
  if (!out.ok) return res.status(out.status || 500).json({ ok:false, error: out.error })
  const items = (out.data?.data || []).map((i: any) => ({ id: i.id, name: i.name, audience_size: i.audience_size || null }))
  return res.status(200).json({ ok:true, data: items })
}
