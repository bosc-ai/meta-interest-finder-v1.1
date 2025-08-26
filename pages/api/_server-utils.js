
const API_VERSION = process.env.META_API_VERSION || 'v20.0'
function buildURL(path, params) {
  const url = new URL(`https://graph.facebook.com/${API_VERSION}/${path}`)
  for (const [k,v] of Object.entries(params || {})) { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v)) }
  return url.toString()
}
async function metaFetch(path, params) {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) return { ok:false, status:500, error:'Missing META_ACCESS_TOKEN on server' }
  const url = buildURL(path, { ...params, access_token: token })
  const res = await fetch(url)
  if (!res.ok) { const err = await res.text(); return { ok:false, status: res.status, error: err } }
  const data = await res.json()
  return { ok:true, data }
}
function mapInterest(item) {
  return { id: item.id, name: item.name, topic: item.topic, path: item.path, audience_size: item.audience_size || item.audience_size_lower || item.audience_size_upper || null }
}
module.exports = { metaFetch, buildURL, mapInterest }
