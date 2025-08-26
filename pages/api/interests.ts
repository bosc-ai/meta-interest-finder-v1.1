
import { NextApiRequest, NextApiResponse } from 'next'
const { metaFetch, mapInterest } = require('./_server-utils')
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q = '', limit = '25', country = 'ALL' } = req.query
  if (!q || typeof q !== 'string') return res.status(200).json({ ok:true, data: [] })
  let params: any = { type: 'adinterest', q, limit, locale: 'en_US' }
  if (country && country !== 'ALL') params.country = country
  let out = await metaFetch('search', params)
  if (!out.ok && country && country !== 'ALL') { params = { type: 'adinterest', q, limit, locale: 'en_US' }; out = await metaFetch('search', params) }
  if (!out.ok) return res.status(out.status || 500).json({ ok:false, error: out.error })
  const items = (out.data?.data || []).map(mapInterest)
  return res.status(200).json({ ok:true, data: items })
}
