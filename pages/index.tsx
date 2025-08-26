import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy, Check, Download, Trash2, Database, Plus, Search, Globe,
  Moon, Sun, Target, Sparkle, Github, Users, Instagram, Facebook, Linkedin, Twitter, Utensils
} from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import { toCSV, copyToClipboard, countries } from '@/components/export-utils'

function useTheme() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefers = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    const enable = saved ? saved === 'dark' : prefers
    setDark(enable)
    document.documentElement.classList.toggle('dark', enable)
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('theme', dark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', dark)
  }, [dark, mounted])
  return { dark, setDark, mounted }
}

function ThemeToggle() {
  const { dark, setDark, mounted } = useTheme()
  if (!mounted) return null
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setDark(v => !v)}
      className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
      <span className="hidden sm:inline text-sm">{dark ? 'Light' : 'Dark'} mode</span>
    </button>
  )
}

function estimateSize(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const min = 50_000, max = 5_000_000
  return min + (h % (max - min))
}
const Container = ({ children, className = '' }: { children: any, className?: string }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
)
const countryFlag = (code = '') =>
  code.toUpperCase().replace(/[^A-Z]/g, '')
      .split('')
      .map(c => String.fromCodePoint(127397 + c.charCodeAt(0)))
      .join('')

function ParticlesHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let W = 0, H = 0, raf = 0
    const P = Array.from({ length: 70 }, () => ({ x: 0, y: 0, vx: (Math.random() - .5) * .7, vy: (Math.random() - .5) * .7, r: Math.random() * 2 + 1 }))
    const resize = () => {
      const parent = canvas.parentElement as HTMLElement; W = canvas.width = parent.clientWidth; H = canvas.height = 340
      P.forEach(p => { p.x = Math.random() * W; p.y = Math.random() * H })
    }
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const p of P) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(45,140,255,.55)'; ctx.fill()
      }
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const a = P[i], b = P[j] as any; const d = Math.hypot((a as any).x - b.x, (a as any).y - b.y)
        if (d < 86) {
          ctx.strokeStyle = `rgba(45,140,255,${(1 - d / 86) * .25})`
          ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo((a as any).x, (a as any).y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    resize(); draw(); const ro = new ResizeObserver(resize); canvas.parentElement && ro.observe(canvas.parentElement)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 -z-10 pointer-events-none" />
}

const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxTW1snZKl1CNXQLEJJpEmFR2H-BkzF93UDxJi3hVoutwADXYC8em_C_iZ_uDFUWerV6g/exec'

export default function Home() {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('IN')
  const [tab, setTab] = useState<'interests'|'behaviors'|'jobtitles'|'employers'|'education'|'industry'>('interests')
  const [rows, setRows] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [limit, setLimit] = useState(25)
  const [eduType, setEduType] = useState('adeducationmajor')
  const [closeKey, setCloseKey] = useState(0)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  useEffect(() => {
    const $ = (id: string) => document.getElementById(id)
    const form = $('contactForm') as HTMLFormElement | null
    if (!form) return

    const btn  = $('submitBtn') as HTMLButtonElement | null
    const msg  = $('formMsg') as HTMLElement | null

    const firstName = $('firstName') as HTMLInputElement | null
    const lastName  = $('lastName') as HTMLInputElement | null

    const prefEmail = $('prefEmail') as HTMLInputElement | null
    const prefWA    = $('prefWhatsApp') as HTMLInputElement | null
    const prefCall  = $('prefCall') as HTMLInputElement | null

    const emailField = $('emailField') as HTMLElement | null
    const phoneField = $('phoneField') as HTMLElement | null
    const waField    = $('waField') as HTMLElement | null

    const contactEmail = $('contactEmail') as HTMLInputElement | null
    const phone        = $('phone') as HTMLInputElement | null
    const whatsapp     = $('whatsapp') as HTMLInputElement | null
    const countryCode  = $('countryCode') as HTMLSelectElement | null
    const waCountryCode= $('waCountryCode') as HTMLSelectElement | null

    const optEmail = prefEmail?.closest('.option') as HTMLElement | null
    const optWA    = prefWA?.closest('.option') as HTMLElement | null
    const optCall  = prefCall?.closest('.option') as HTMLElement | null

    const setActive = (el: Element | null, on: boolean) => { if (el) (el as HTMLElement).classList.toggle('active', !!on) }

    const toggle = () => {
      const eOn = !!prefEmail?.checked
      const cOn = !!prefCall?.checked
      const wOn = !!prefWA?.checked
      emailField?.classList.toggle('hidden', !eOn)
      phoneField?.classList.toggle('hidden', !cOn)
      waField?.classList.toggle('hidden', !wOn)
      if (contactEmail) contactEmail.required = eOn
      if (phone) phone.required = cOn
      if (whatsapp) whatsapp.required = wOn
      setActive(optEmail, eOn); setActive(optWA, wOn); setActive(optCall, cOn)
    }

    ;[prefEmail, prefWA, prefCall].forEach(cb => cb?.addEventListener('change', toggle))
    toggle()

    const attachRipple = (el: Element) => {
      const handler = (e: Event) => {
        const evt = e as MouseEvent
        const rect = (el as HTMLElement).getBoundingClientRect()
        const span = document.createElement('span')
        span.className = 'ripple'
        span.style.left = (evt.clientX - rect.left) + 'px'
        span.style.top  = (evt.clientY - rect.top)  + 'px'
        el.appendChild(span)
        setTimeout(() => span.remove(), 650)
      }
      el.addEventListener('click', handler)
      return () => el.removeEventListener('click', handler)
    }
    const ripplers = Array.from(document.querySelectorAll('#contact .interactive')).map(attachRipple)

    const digitsOnly = (s: string) => (s || '').split('').filter(c => c >= '0' && c <= '9').join('')

    const onSubmit = async (e: Event) => {
      e.preventDefault()
      if (msg) msg.textContent = ''
      const eOn = !!prefEmail?.checked, cOn = !!prefCall?.checked, wOn = !!prefWA?.checked
      if (!(eOn || cOn || wOn)) { if (msg) msg.textContent = 'Please select at least one contact method.'; return }
      if (!form.reportValidity()) return

      const phoneDigits = digitsOnly(phone?.value || '')
      const waDigits    = digitsOnly(whatsapp?.value || '')
      if (cOn && countryCode?.value === '+91' && phoneDigits.length !== 10) { if (msg) msg.textContent = 'Phone number must be 10 digits for India.'; return }
      if (wOn && waCountryCode?.value === '+91' && waDigits.length !== 10)   { if (msg) msg.textContent = 'WhatsApp must be 10 digits for India.'; return }

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…' }
      try {
        const payload = {
          name: `${firstName?.value?.trim() || ''} ${lastName?.value?.trim() || ''}`.trim(),
          email: '',
          company: (form as any).company?.value?.trim() ?? '',
          service: (form as any).service?.value?.trim() ?? '',
          message: (form as any).message?.value?.trim() ?? '',
          contact_pref: {
            email: eOn ? (contactEmail?.value?.trim() || '') : '',
            call:  cOn ? `${countryCode?.value || ''} ${phoneDigits}`.trim() : '',
            whatsapp: wOn ? `${waCountryCode?.value || ''} ${waDigits}`.trim() : ''
          },
          source: 'portfolio-site',
          timestamp: new Date().toISOString()
        }

        await fetch(GAS_ENDPOINT, {
          method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        })

        ;(form as HTMLFormElement).reset(); toggle()
        if (btn) btn.textContent = 'Sent ✓'
        if (msg) msg.textContent = 'Thanks! Your message has been sent.'
        window.dispatchEvent(new CustomEvent('lead_submit', { detail: payload }))
      } catch (err) {
        console.error(err)
        if (msg) msg.textContent = 'Something went wrong. Please email me directly.'
        if (btn) btn.textContent = 'Send message'
      } finally {
        if (btn) { btn.disabled = false; setTimeout(() => { if (btn) btn.textContent = 'Send message' }, 2000) }
      }
    }

    form.addEventListener('submit', onSubmit)

    return () => {
      form.removeEventListener('submit', onSubmit)
      ripplers.forEach(off => off && typeof off === 'function' && off())
      ;[prefEmail, prefWA, prefCall].forEach(cb => cb?.removeEventListener('change', toggle))
    }
  }, [])

  const addRow = (r: any) => setRows(prev => prev.find(x => x.id === r.id) ? prev : [...prev, r])
  const addMany = (rs: any[]) => setRows(prev => { const map = new Map(prev.map((p: any) => [p.id, p])); for (const r of rs) if (!map.has(r.id)) map.set(r.id, r); return Array.from(map.values()) })
  const removeRow = (id: string) => setRows(prev => prev.filter((x: any) => x.id !== id))
  const clearRows = () => setRows([])

  const exportCSV = () => {
    const csv = toCSV(rows.map((r: any) => ({ id: r.id, name: r.name, audience_size: r.audience_size ?? `~${estimateSize(r.id)}` })))
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'targeting.csv'
    link.click()
  }
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'targeting.json'
    link.click()
  }
  const formatSize = (r: any) => r.audience_size ? r.audience_size.toLocaleString() : `~${estimateSize(r.id).toLocaleString()}`

  const buildSuggestUrl = (q: string) => {
    const lim = 8
    if (tab === 'interests') return `/api/interests?q=${encodeURIComponent(q)}&limit=${lim}&country=${country}`
    if (tab === 'employers') return `/api/targeting?type=adworkemployer&q=${encodeURIComponent(q)}&limit=${lim}`
    if (tab === 'jobtitles') return `/api/targeting?type=adworkposition&q=${encodeURIComponent(q)}&limit=${lim}`
    if (tab === 'education') return `/api/targeting?type=${eduType}&q=${encodeURIComponent(q)}&limit=${lim}`
    if (tab === 'behaviors') return `/api/behaviors?q=${encodeURIComponent(q)}&limit=${lim}`
    if (tab === 'industry') return `/api/categories?klass=industries&q=${encodeURIComponent(q)}&limit=${lim}`
    return `/api/interests?q=${encodeURIComponent(q)}&limit=${lim}&country=${country}`
  }

  const doSearch = async () => {
    if (!query) return
    const lim = Math.min(Math.max(1, Number(limit) || 25), 500)
    let url = ''
    if (tab === 'interests') url = `/api/interests?q=${encodeURIComponent(query)}&country=${country}&limit=${lim}`
    else if (tab === 'employers') url = `/api/targeting?type=adworkemployer&q=${encodeURIComponent(query)}&limit=${lim}`
    else if (tab === 'jobtitles') url = `/api/targeting?type=adworkposition&q=${encodeURIComponent(query)}&limit=${lim}`
    else if (tab === 'education') url = `/api/targeting?type=${eduType}&q=${encodeURIComponent(query)}&limit=${lim}`
    else if (tab === 'behaviors') url = `/api/behaviors?q=${encodeURIComponent(query)}&limit=${lim}`
    else if (tab === 'industry') url = `/api/categories?klass=industries&q=${encodeURIComponent(query)}&limit=${lim}`

    try {
      setCloseKey(k => k + 1)
      setSuggestionsOpen(false)
      const r = await fetch(url)
      const j = await r.json()
      setResults(j.ok ? (j.data || []) : [])
    } catch {
      setResults([])
    }
  }

  const card = 'glass rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/10 bg-white/70 dark:bg-slate-900/70'
  const btn = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition'
  const btnGhost = 'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
  const input = 'bg-transparent outline-none border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2'
  const select = `${input} pr-8`
  const tableBase = 'min-w-full text-left text-sm'
  const th = 'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200 dark:border-slate-800'
  const td = 'px-4 py-3 border-b border-slate-100 dark:border-slate-800'

  const selectedIds = new Set(rows.map((r: any) => r.id))
  const allAdded = results.length > 0 && results.every((r: any) => selectedIds.has(r.id))

  return (
    <>
      <Head>
        <title>Meta Interest Finder Pro — 100% Free</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="100% free Meta Ads targeting finder with country filter, audience sizes, and exports. Unlimited. No login." />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-500/20">
        <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-16 w-[520px] h-[520px] rounded-full blur-3xl bg-indigo-500/15 dark:bg-indigo-500/10 animate-pulse" />
          <div className="absolute -bottom-24 -right-16 w-[460px] h-[460px] rounded-full blur-3xl bg-cyan-400/20 dark:bg-cyan-400/10 animate-pulse" />
        </div>

        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-900/5 dark:border-white/10">
          <Container className="h-16 flex items-center justify-between">
            <a className="flex items-center gap-3" href="#">
              <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,.35)]">
                <Target className="w-5 h-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">Interest Finder <span className="text-indigo-600 dark:text-indigo-400">Pro</span></span>
            </a>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#app" className="hover:text-indigo-600 dark:hover:text-indigo-400">App</a>
              <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
              <a href="#contributors" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contributors</a>
              <a href="#contact" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </Container>
        </header>

        <section className="relative overflow-hidden">
          <ParticlesHero />
          <Container className="py-16 lg:py-24">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-900/10 mb-5">
                  <Sparkle className="w-4 h-4" /> World’s first 100% free, no-login Meta Interest Finder - unlimited
                </motion.p>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }} className="text-4xl sm:text-5xl font-extrabold leading-tight">
                  Find Meta Ads <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">interests</span> that convert.
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                  Search interests, behaviors, employers, job titles, education & industry. Filter by country, see audience size, export in CSV/JSON, or copy IDs.
                </motion.p>
              </div>
              <div className="lg:col-span-5">
                <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15 }} className={`${card} p-5 shadow-xl relative`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-slate-500"><Target className="w-4 h-4 text-indigo-500" /> <span>Discovery</span></div>
                    <span className="text-xs px-2 py-1 rounded bg-indigo-600/10 text-indigo-700 dark:text-indigo-300">Unlimited</span>
                  </div>
                  <div className="space-y-3">
                    {[{ name: 'Ayurvedic skincare', id: '6003451234567', reach: '1.2M' }, { name: 'Oxidised Jewellery', id: '6003378890123', reach: '820K' }, { name: 'Real Estate', id: '6003033311224', reach: '3.1M' }].map((m, i) => (
                      <div key={m.id} style={{ animationDelay: `${i * 0.08}s` }} className="opacity-0 animate-[fadeIn_.6s_forwards] flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 ring-1 ring-slate-900/5 dark:ring-white/10">
                        <div>
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-slate-500">ID: {m.id}</div>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">{m.reach}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </Container>
        </section>

        <section id="features" className="py-16">
          <Container>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Search className="w-5 h-5" />, title: 'All targeting types', text: 'Interests, behaviors, demographics, job titles & more in one UI.' },
                { icon: <Globe className="w-5 h-5" />, title: 'Country-aware', text: 'Pick any country by ISO code (IN, US, AE, …) for audience estimates.' },
                { icon: <Download className="w-5 h-5" />, title: 'CSV / JSON / Copy', text: 'Export clean lists or copy interest IDs in one click. No login.' },
              ].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .4, delay: i * 0.08 }} className={`${card} p-6`}>
                  <div className="w-10 h-10 grid place-items-center rounded-lg bg-indigo-600/10 text-indigo-600 mb-3">{f.icon}</div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{f.text}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        <section id="app" className="py-12 bg-white/70 dark:bg-slate-900/40">
          <Container>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Meta Interest Finder <span className="text-indigo-400">PRO</span></h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Search interests with audience size, get suggestions, and export your picks.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`${card} flex items-center gap-2 px-3 py-2`}>
                  <Globe className="w-4 h-4 text-slate-400" />
                  <select
                    className={select}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    aria-label="Country"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>
                        {countryFlag(c.code)} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
               <button onClick={clearRows} className={btnGhost}><Trash2 className="w-4 h-4" />Clear</button>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={exportCSV} className={btn}><Download className="w-4 h-4" />CSV</button>
                  <button onClick={exportJSON} className={btn}><Database className="w-4 h-4" />JSON</button>
                  <button
                    onClick={() => { copyToClipboard(JSON.stringify(rows, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
                    className={btnGhost}
                  >
                    {copied ? <><Check className="w-4 h-4" />Copied</> : <><Copy className="w-4 h-4" />Copy</>}
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-2">
              {['interests', 'behaviors', 'jobtitles', 'employers', 'education', 'industry'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t as any); setResults([]); setQuery(''); setCloseKey(k => k + 1); setSuggestionsOpen(false) }}
                  className={`px-4 py-2 rounded-xl border transition ${
                    tab === t
                      ? 'bg-white text-slate-900 border-white shadow'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-900/30 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  {t === 'jobtitles' ? 'Job Title' : (t as string).charAt(0).toUpperCase() + (t as string).slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <div className={`${card} p-4 md:p-6`}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <SearchBar
                      value={query}
                      setValue={(v: string) => { setQuery(v); setSuggestionsOpen(Boolean(v)) }}
                      onPick={(s: any) => { addRow({ id: s.id, name: s.name, audience_size: s.audience_size }); setCloseKey(k => k + 1); setSuggestionsOpen(false) }}
                      onEnter={doSearch}
                      placeholder={
                        tab === 'interests' ? 'Search interests (e.g., Shopify, Jogging, Crypto)…' :
                        tab === 'behaviors' ? 'Search behaviors…' :
                        tab === 'jobtitles' ? 'Search job titles…' :
                        tab === 'employers' ? 'Search employers…' :
                        tab === 'education' ? (eduType === 'adeducationmajor' ? 'Search fields of study…' : 'Search schools…') :
                        'Search industry…'
                      }
                      suggestUrlBuilder={buildSuggestUrl}
                      closeSignal={closeKey}
                    />
                    <div className="flex items-center gap-2">
                      {tab === 'education' && (
                        <select className={select} value={eduType} onChange={(e) => setEduType(e.target.value)}>
                          <option value="adeducationmajor">Education Major</option>
                          <option value="adeducationschool">Education School</option>
                        </select>
                      )}
                      <input
                        type="number" min={1} max={500} value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value || '25', 10))}
                        className={`${input} w-24 text-center`} placeholder="Limit" title="Number of results to fetch"
                      />
                      <button onClick={doSearch} className={btn}><Search className="w-4 h-4" />Search</button>
                    </div>
                  </div>

                  <div className={`${card} p-0 overflow-hidden`}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="text-sm text-slate-500">Results {results.length ? `(${results.length})` : ''}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addMany(results)}
                          disabled={allAdded}
                          className={`${btnGhost} ${allAdded ? 'cursor-default opacity-60' : ''}`}
                        >
                          {allAdded ? 'All added' : <><Plus className="w-4 h-4" />Add All</>}
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className={`${tableBase}`}>
                        <thead>
                          <tr>
                            <th className={th} style={{ width: '42px' }}>#</th>
                            <th className={th}>Name</th>
                            <th className={`${th} hidden md:table-cell`}>ID</th>
                            <th className={`${th} hidden md:table-cell`}>Audience Size</th>
                            <th className={th}></th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence initial={false}>
                            {results.map((r: any, idx: number) => {
                              const added = selectedIds.has(r.id)
                              return (
                                <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                                  <td className={td + " text-slate-500"}>{idx + 1}</td>
                                  <td className={td + " font-medium"}>{r.name}</td>
                                  <td className={td + " hidden md:table-cell text-slate-400"}>{r.id}</td>
                                  <td className={td + " hidden md:table-cell"}>{r.audience_size ? r.audience_size.toLocaleString() : `~${estimateSize(r.id).toLocaleString()}`}</td>
                                  <td className={td + " text-right"}>
                                    <button
                                      onClick={() => !added && addRow(r)}
                                      disabled={added}
                                      className={`${btnGhost} ${added
                                        ? 'cursor-default opacity-60 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : ''}`}
                                      aria-pressed={added}
                                    >
                                      {added ? <>Added</> : <><Plus className="w-4 h-4" />Add</>}
                                    </button>
                                  </td>
                                </motion.tr>
                              )
                            })}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                    {results.length === 0 && (<div className="p-6 text-center text-slate-500">{suggestionsOpen ? 'Pick a suggestion to add it instantly to selections.' : 'No results yet. Enter a keyword and press Enter or click Search.'}</div>)}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="donate" className="py-16">
          <Container>
            <div className={`${card} p-6 sm:p-8`}>
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                <div className="w-12 h-12 grid place-items-center rounded-2xl bg-amber-400/20 text-amber-600 shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-[16rem]">
                  <h3 className="text-2xl md:text-3xl font-extrabold">Buy me a Biriyani 🍲</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">Pay what you want - Your support helps us keep this platform free for everyone.</p>
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                    <a
                      href="https://razorpay.me/@serves"
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label="Buy me a Biriyani"
                      className="no-underline inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 active:scale-[.98] transition w-full sm:w-auto"
                    >
                      <Utensils className="w-5 h-5" />
                      <span> Support </span>
                    </a>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Your payment is simple, secure, and completely anonymous. Just two steps to contribute.</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-6">
          <Container>
            <div className={`${card} overflow-hidden`}>
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="font-medium">Selections</div>
                <div className="md:hidden flex gap-2">
                  <button onClick={exportCSV} className={btn}><Download className="w-4 h-4" />CSV</button>
                  <button onClick={exportJSON} className={btn}><Database className="w-4 h-4" />JSON</button>
                  <button onClick={() => { copyToClipboard(JSON.stringify(rows, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className={btnGhost}>
                    {copied ? <>Copied</> : <><Copy className="w-4 h-4" />Copy</>}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className={tableBase}>
                  <thead>
                    <tr>
                      <th className={th} style={{ width: '42px' }}>#</th>
                      <th className={th}>Name</th>
                      <th className={`${th} hidden md:table-cell`}>ID</th>
                      <th className={`${th} hidden md:table-cell`}>Audience Size</th>
                      <th className={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {rows.map((r: any, idx: number) => (
                        <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                          <td className={td + " text-slate-500"}>{idx + 1}</td>
                          <td className={td + " font-medium"}>{r.name}</td>
                          <td className={td + " hidden md:table-cell text-slate-400"}>{r.id}</td>
                          <td className={td + " hidden md:table-cell"}>{formatSize(r)}</td>
                          <td className={td + " text-right"}><button onClick={() => removeRow(r.id)} className={btnGhost}><Trash2 className="w-4 h-4" /></button></td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && (<div className="p-8 text-center text-slate-500">No selections yet. Use the search above and click Add.</div>)}
            </div>
          </Container>
        </section>

        <section id="contributors" className="py-16">
          <Container>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 grid place-items-center rounded-xl bg-emerald-500/10 text-emerald-600"><Users className="w-5 h-5" /></div>
              <h3 className="text-2xl font-extrabold">Developers & Contributors</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.a href="https://prateek.serves.in/" target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`${card} p-6 flex items-center gap-4 no-underline`}>
                <div className="w-12 h-12 grid place-items-center rounded-2xl bg-indigo-500/15 text-indigo-600"><Github className="w-5 h-5" /></div>
                <div>
                  <div className="text-lg font-bold">Prateek Prakash</div>
                  <div className="text-sm text-slate-500">Consultant · Growth & Performance</div>
                </div>
              </motion.a>
              <motion.a href="https://sumeet.serves.in/" target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`${card} p-6 flex items-center gap-4 no-underline`}>
                <div className="w-12 h-12 grid place-items-center rounded-2xl bg-cyan-500/15 text-cyan-600"><Github className="w-5 h-5" /></div>
                <div>
                  <div className="text-lg font-bold">Sumeet Singh</div>
                  <div className="text-sm text-slate-500"> Developer · Systems & Automation</div>
                </div>
              </motion.a>
            </div>
          </Container>
        </section>

        <section id="contact">
          <div className="container">
            <div className="section-head">
              <h2>Let’s talk growth</h2>
              <p>Send a note or book a slot. I’ll reply within 1 business day.</p>
            </div>
            <div className="grid grid-contact" style={{ gap: '12px' }}>
              <div className="card interactive">
                <form id="contactForm" action="#" method="post" noValidate>
                  <div className="row two">
                    <div>
                      <label htmlFor="firstName">First name</label>
                      <input id="firstName" name="firstName" type="text" required placeholder="First name" />
                    </div>
                    <div>
                      <label htmlFor="lastName">Last name</label>
                      <input id="lastName" name="lastName" type="text" required placeholder="Last name" />
                    </div>
                  </div>

                  <div className="card interactive" style={{ margin: '2px 0', padding: '14px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>How should I contact you? <span style={{ color: '#aeb6c7' }}>(choose one or more)</span></label>
                    <div className="contact-options">
                      <label className="option interactive"><input type="checkbox" id="prefEmail" /> <span className="option-label">E‑mail</span></label>
                      <label className="option interactive"><input type="checkbox" id="prefWhatsApp" /> <span className="option-label">WhatsApp</span></label>
                      <label className="option interactive"><input type="checkbox" id="prefCall" /> <span className="option-label">Call</span></label>
                    </div>

                    <div id="emailField" className="hidden" style={{ marginTop: '10px' }}>
                      <label htmlFor="contactEmail">Your best email</label>
                      <input id="contactEmail" name="contactEmail" type="email" placeholder="name@company.com" />
                    </div>

                    <div id="phoneField" className="hidden" style={{ marginTop: '10px' }}>
                      <label htmlFor="phone">Phone for call back</label>
                      <div className="row two">
                        <select id="countryCode" name="countryCode" defaultValue={'+91'}>
                          <option value="+91">🇮🇳 +91 (IN)</option>
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+61">🇦🇺 +61 (AU)</option>
                          <option value="+971">🇦🇪 +971 (AE)</option>
                          <option value="+65">🇸🇬 +65 (SG)</option>
                        </select>
                        <input id="phone" name="phone" type="tel" inputMode="tel" placeholder="10‑digit number" />
                      </div>
                    </div>

                    <div id="waField" className="hidden" style={{ marginTop: '10px' }}>
                      <label htmlFor="whatsapp">WhatsApp number</label>
                      <div className="row two">
                        <select id="waCountryCode" name="waCountryCode" defaultValue={'+91'}>
                          <option value="+91">🇮🇳 +91 (IN)</option>
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+61">🇦🇺 +61 (AU)</option>
                          <option value="+971">🇦🇪 +971 (AE)</option>
                          <option value="+65">🇸🇬 +65 (SG)</option>
                        </select>
                        <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="WhatsApp number" />
                      </div>
                    </div>
                  </div>

                  <div className="row two">
                    <div>
                      <label htmlFor="company">Company (optional)</label>
                      <input id="company" name="company" type="text" placeholder="Brand / Company" />
                    </div>
                    <div>
                      <label htmlFor="service">Consultation Service</label>
                      <input id="service" name="service" type="text" placeholder="Paid Ads / SEO / SMM" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message">Project brief</label>
                    <textarea id="message" name="message" rows={5} placeholder="What are your goals? Timelines? Budget range?" required></textarea>
                  </div>

                  <button className="cta interactive" id="submitBtn" type="submit" style={{ width: 'fit-content' }}>Send message</button>

                  <div className="socials" style={{ marginTop: '10px' }}>
                    <a className="soc" href="https://instagram.com/prateekprakash.solopreneur" target="_blank" rel="me noopener" title="Instagram" aria-label="Instagram"><Instagram className="icon" /></a>
                    <a className="soc" href="https://facebook.com/prateekprakash.solopreneur" target="_blank" rel="me noopener" title="Facebook" aria-label="Facebook"><Facebook className="icon" /></a>
                    <a className="soc" href="https://linkedin.com/in/prateeksolopreneur" target="_blank" rel="me noopener" title="LinkedIn" aria-label="LinkedIn"><Linkedin className="icon" /></a>
                    <a className="soc" href="https://x.com/prateekprakash_" target="_blank" rel="me noopener" title="Twitter/X" aria-label="Twitter/X"><Twitter className="icon" /></a>
                    <a className="soc" href="mailto:prateek.adsmanager@gmail.com" title="Work mail" aria-label="Work Mail">✉️</a>
                  </div>
                  <p id="formMsg" className="notice" role="status" aria-live="polite"></p>
                </form>
              </div>

              <aside className="card interactive" style={{ position: 'relative', overflow: 'hidden' }}>
  {/* soft gradient glow */}
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: -24,
      background:
        'radial-gradient(600px 220px at 120% -20%, rgba(99,102,241,.18), transparent 60%), radial-gradient(520px 200px at -20% 120%, rgba(236,72,153,.16), transparent 60%)',
      filter: 'blur(2px)',
      pointerEvents: 'none'
    }}
  />
  <div style={{ position: 'relative' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
      <span
        style={{
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(99,102,241,.12)',
          color: '#4f46e5',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: .2
        }}
      >
        15 MIN
      </span>
      <div>
        <h3 style={{ margin: 0 }}>Book a 15-min Strategy Call</h3>
        <p style={{ margin: '2px 0 0', color: '#64748b' }}>Instant confirmation · Google Meet</p>
      </div>
    </div>

    {/* quick slots */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0 12px' }}>
          </div>

    <p>
      <a
        className="cta interactive"
        style={{ padding: '12px 16px', width: '100%', justifyContent: 'center', fontWeight: 700 }}
        href="https://cal.com/prateekadsmanager/15min"
        target="_blank"
        rel="noopener"
      >
        Schedule Call
      </a>
    </p>

    <hr style={{ border: 'none', borderTop: '1px solid rgba(15,23,42,.12)', margin: '12px 0' }} />

    <h3 style={{ marginTop: 0 }}>Quick facts</h3>
    <ul className="list" style={{ listStyle: 'none', padding: 0, margin: 0, color: '#64748b' }}>
      <li>• Based in India; global clients</li>
      <li>• Typical engagement: 3–6 months</li>
      <li>• Reports: weekly + monthly reviews</li>
    </ul>
  </div>
</aside>

            </div>
          </div>
        </section>

        <footer className="py-10">
          <Container>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="relative grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 text-white"><Target className="w-4 h-4" /></span>
                <span className="font-semibold">Interest Finder Pro</span>
                <span className="text-slate-400">© {new Date().getFullYear()} · serves.in</span>
              </div>
              <div className="text-sm text-slate-400">Made with Love ❤️. No login. No paywall. Unlimited.</div>
            </div>
          </Container>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes fadeIn { to { opacity: 1; transform: translateY(0) } }
        .glass { backdrop-filter: blur(10px) }
        .container { max-width: 72rem; margin: 0 auto; padding: 0 1rem; }
        .section-head { text-align: center; padding: 2rem 0 1rem; }
        .section-head h2 { font-weight: 800; font-size: 2rem; }
        .section-head p { color: var(--muted, #64748b); } .row { margin: 10px 0 }
        .grid-contact { display: grid; grid-template-columns: 1fr; }
        @media (min-width: 900px){ .grid-contact { grid-template-columns: 2fr 1fr; } }
        .card { background: rgba(255,255,255,.75); border: 1px solid rgba(15,23,42,.10); border-radius: 16px; padding: 16px; }
        :root.dark .card { background: rgba(2,6,23,.72); border-color: rgba(255,255,255,.14); }
        .row.two { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 640px){ .row.two { grid-template-columns: 1fr 1fr; gap: 16px; } }
        label { display:block; font-size:.9rem; margin: 6px 0; color: inherit }
        input, select, textarea { width: 100%; border:1px solid rgba(15,23,42,.18); background: #ffffff; padding: 10px 12px; border-radius: 12px; color: #0f172a }
        input:focus, select:focus, textarea:focus { outline: 2px solid rgba(79,70,229,.35) }
        input::placeholder, textarea::placeholder { color: #94a3b8 }
        :root.dark input, :root.dark select, :root.dark textarea { background: rgba(7,11,24,.9); color: #e2e8f0; border-color: rgba(255,255,255,.18) }
        :root.dark input::placeholder, :root.dark textarea::placeholder { color: rgba(226,232,240,.55) }
        .hidden { display: none !important }
        .interactive { position: relative; overflow: hidden; }
        .ripple { position:absolute; width:14px; height:14px; border-radius:999px; transform:translate(-50%, -50%); background: rgba(99,102,241,.35); animation: rip 650ms ease-out forwards }
        @keyframes rip { from { opacity:.7; transform: translate(-50%,-50%) scale(.8) } to { opacity:0; transform: translate(-50%,-50%) scale(9) } }
        .contact-options { display:flex; gap:8px; flex-wrap:wrap }
        .option { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid rgba(15,23,42,.15); border-radius:999px; cursor:pointer; user-select:none }
        .option.active { background: rgba(16,185,129,.12); border-color: rgba(16,185,129,.4) }
        .option .option-label { font-size: .9rem }
        .cta { display:inline-flex; align-items:center; gap:8px; background:#4f46e5; color:#fff; padding:10px 16px; border-radius: 12px; text-decoration:none }
        .cta:hover { filter: brightness(.95) }
        .list { padding-left: 18px }
        .list li { margin: 6px 0 }
        .socials { display:flex; gap:10px; align-items:center }
        .soc { width:38px; height:38px; display:grid; place-items:center; border-radius:12px; border:1px solid rgba(15,23,42,.12); background: rgba(255,255,255,.6); }
        .icon { width:18px; height:18px }
        :root.dark .soc { background: rgba(3,7,18,.8); border-color: rgba(255,255,255,.14) }
        .notice { font-size: .9rem; margin-top: 4px; color: #10b981 }
      `}</style>
    </>
  )
}
