import { useEffect, useState, useRef } from 'react'

function parseGviz(text) {
  // gviz returns: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const m = text.match(/setResponse\((.*)\);\s*$/s)
  if (!m) return null
  try {
    return JSON.parse(m[1])
  } catch (e) {
    return null
  }
}

function buildSheetUrl(sheetId, sheetName) {
  return (
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq` +
    `?sheet=${encodeURIComponent(sheetName)}` +
    `&tq=${encodeURIComponent('select *')}` +
    `&cachebust=${Date.now()}`
  )
}

function fetchGvizJsonp(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('JSONP requires browser environment'))
      return
    }

    const callbackName = `__gviz_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')

    const cleanUp = () => {
      try { delete window[callbackName] } catch (e) {}
      if (script.parentNode) script.parentNode.removeChild(script)
    }

    const timer = setTimeout(() => {
      cleanUp()
      reject(new Error('JSONP timeout while loading Google Sheets'))
    }, timeoutMs)

    window[callbackName] = (payload) => {
      clearTimeout(timer)
      cleanUp()
      resolve(payload)
    }

    script.onerror = () => {
      clearTimeout(timer)
      cleanUp()
      reject(new Error('JSONP script load failed'))
    }

    // gviz supports a custom response handler via tqx responseHandler.
    script.src = `${url}&tqx=${encodeURIComponent(`out:json;responseHandler:${callbackName}`)}`
    document.head.appendChild(script)
  })
}

export default function useGoogleSheets(sheetId, sheetNames = [], opts = {}) {
  const { pollInterval = 60000 } = opts
  const [data, setData] = useState([])
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    let timer = null

    async function fetchAll() {
      try {
        const combined = []
        for (const name of sheetNames) {
          const url = buildSheetUrl(sheetId, name)
          let json = null

          // Try normal fetch first.
          try {
            const res = await fetch(`${url}&tqx=out:json`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const text = await res.text()
            json = parseGviz(text)
          } catch (fetchErr) {
            // Fallback for deployments where browser fetch/CORS behavior differs.
            try {
              json = await fetchGvizJsonp(url)
            } catch (jsonpErr) {
              console.error(`[useGoogleSheets] failed for sheet "${name}"`, fetchErr, jsonpErr)
              continue
            }
          }

          if (!json || !json.table) continue
          const cols = (json.table.cols || []).map(c => (c.label || '').trim())
          const rows = json.table.rows || []
          for (const r of rows) {
            const obj = {}
            for (let i = 0; i < cols.length; i++) {
              const key = cols[i] || `col${i}`
              const cell = r.c && r.c[i]
              obj[key] = cell ? cell.v : ''
            }
            // Normalize common header names to match the dashboard's expected keys
            const norm = {}
            const headerToKey = k => (k||'').toString().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
            const find = names => {
              for (const h of Object.keys(obj)) {
                const n = headerToKey(h)
                if (names.some(x => n.includes(x))) return obj[h]
              }
              return undefined
            }

            norm.inv = find(['inv','invoice','c inv']) || obj['Inv'] || obj['Invoice No'] || ''
            norm.date = find(['date','inv date','invoice date']) || ''
            norm.month = find(['month']) || ''
            norm.fy = find(['fy','financial']) || ''
            // derive fiscal year from date when fy header not present
            if (!norm.fy) {
              const dateRaw = find(['date','inv date','invoice date']) || obj['C.Inv Date'] || obj['Invoice Date'] || ''
              let d = null
              if (typeof dateRaw === 'string' && dateRaw.trim()) {
                const parsed = Date.parse(dateRaw)
                if (!isNaN(parsed)) d = new Date(parsed)
              } else if (dateRaw && typeof dateRaw === 'object' && dateRaw['v']) {
                try { d = new Date(dateRaw.v) } catch (e) { d = null }
              } else if (dateRaw instanceof Date) {
                d = dateRaw
              }
              if (d) {
                const y = d.getFullYear()
                const m = d.getMonth() + 1 // 1-12
                const start = m >= 4 ? y : y - 1
                const end = (start + 1).toString().slice(-2)
                norm.fy = `${start}-${end}`
              }
            }
            norm.customer = find(['sold to party','sold to','customer','sold to party name']) || find(['sold to party name']) || ''
            norm.material = find(['material','material description','material desc']) || ''
            norm.qty = Number(find(['dispatched qty','qty','dispatched qty.','dispatched qty']) || 0)
            norm.rate = Number(find(['rate','unit rate']) || 0)
            norm.total = Number(find(['total value','total value','gross value','price','total','total value']) || 0)
            norm.region = find(['region','ship to party - region','sold to party - regi','sold to party - region']) || ''
            norm._raw = obj
            combined.push(norm)
          }
        }
        if (mounted.current) {
          setData(combined)
          try {
            console.log('[useGoogleSheets] fetched rows:', combined.length, combined.slice(0,2))
          } catch (e) {}
        }
      } catch (e) {
        console.error('[useGoogleSheets] fetch error:', e)
      }
    }

    fetchAll()
    if (pollInterval > 0) timer = setInterval(fetchAll, pollInterval)
    return () => { mounted.current = false; if (timer) clearInterval(timer) }
  }, [sheetId, JSON.stringify(sheetNames), pollInterval])

  return data
}
