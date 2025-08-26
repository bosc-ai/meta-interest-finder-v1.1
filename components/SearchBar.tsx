import { useEffect, useRef, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

type Suggestion = { id: string; name: string; audience_size?: number }

export default function SearchBar({
  value,
  setValue,
  onPick,
  onEnter,
  placeholder,
  suggestUrlBuilder,
  closeSignal = 0,
}: {
  value: string
  setValue: (q: string) => void
  onPick: (s: Suggestion) => void
  onEnter: () => void
  placeholder?: string
  suggestUrlBuilder: (q: string) => string
  closeSignal?: number
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const debounce = useRef<number | null>(null)

  // Fetch suggestions only while typing (onChange)
  const handleChange = (next: string) => {
    setValue(next)
    if (debounce.current) window.clearTimeout(debounce.current)
    if (!next) { setItems([]); setOpen(false); return }
    debounce.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const url = suggestUrlBuilder(next)
        const res = await fetch(url)
        const data = await res.json()
        if (data.ok) { setItems(data.data); setOpen(true) } else { setItems([]); setOpen(false) }
      } catch { setItems([]); setOpen(false) }
      finally { setLoading(false) }
    }, 250)
  }

  // Externally force-close suggestions
  useEffect(() => { setOpen(false); setItems([]) }, [closeSignal])

  return (
    <div className="relative w-full md:w-auto">
      {/* INPUT */}
      <div
        className="flex items-center gap-2 rounded-2xl border px-4 py-2 transition
                   bg-white border-slate-300 shadow-inner
                   focus-within:ring-2 focus-within:ring-indigo-500
                   dark:bg-slate-900/40 dark:border-slate-700"
      >
        <Search className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        <input
          type="search"
          className="bg-transparent outline-none w-full md:w-[28rem]
                     text-slate-900 placeholder-slate-500
                     dark:text-slate-100 dark:placeholder-slate-400"
          placeholder={placeholder || 'Search...'}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setOpen(false); onEnter() } }}
          onBlur={() => { setTimeout(() => { setOpen(false) }, 120) }}
          aria-expanded={open}
          aria-haspopup="listbox"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>

      {/* DROPDOWN */}
      {open && items.length > 0 && (
        <div
          role="listbox"
          className="absolute z-20 mt-2 w-full rounded-2xl border p-2 max-h-72 overflow-auto shadow-xl
                     bg-white border-slate-200
                     dark:bg-slate-900 dark:border-slate-800"
        >
          {items.map((s) => (
            <button
              type="button"
              role="option"
              key={s.id}
              // prevent the input blur from swallowing clicks
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setValue(s.name)     // fill input
                onPick?.(s)          // add to selections (parent)
                setOpen(false)       // close dropdown
                onEnter?.()          // trigger search now
              }}
              className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between
                         hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="truncate text-slate-900 dark:text-slate-100">{s.name}</span>
              <span className="ml-3 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                {s.audience_size?.toLocaleString?.() || '-'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
