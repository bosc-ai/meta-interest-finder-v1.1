
import { NextApiRequest, NextApiResponse } from 'next'
const { metaFetch } = require('./_server-utils')
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { limit = '200', q = '' } = req.query
  const params: any = { type: 'adtargetingcategory', class: 'behaviors', limit }
  if (q && typeof q === 'string') params.q = q
  const out = await metaFetch('search', params)
  if (!out.ok) return res.status(200).json({ ok:false, notAvailable:true, error: out.error })
  const items = (out.data?.data || []).map((i: any) => ({ id: i.id, name: i.name, description: i.description || null, audience_size: i.audience_size || null }))
  return res.status(200).json({ ok:true, data: items })
}
