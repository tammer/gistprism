import { useState, useEffect } from 'react'
import { API_BASE } from '../lib/api'

function fetchTitleForUrl(url) {
  const params = new URLSearchParams({ url })
  return fetch(`${API_BASE}/api/get_title/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        return { title: null, error: data.error }
      }
      return { title: data.title ?? null, error: null }
    })
    .catch((err) => ({ title: null, error: err.message }))
}

export function usePageTitles(urls) {
  const [titlesByUrl, setTitlesByUrl] = useState(() => new Map())

  useEffect(() => {
    if (!urls?.length) {
      setTitlesByUrl(new Map())
      return
    }

    let cancelled = false
    const inFlight = new Set()

    urls.forEach((url) => {
      if (inFlight.has(url)) return
      inFlight.add(url)
      fetchTitleForUrl(url).then((result) => {
        if (cancelled) return
        inFlight.delete(url)
        setTitlesByUrl((prev) => {
          const next = new Map(prev)
          next.set(url, result)
          return next
        })
      })
    })

    return () => {
      cancelled = true
    }
  }, [urls?.length ? urls.join('\0') : ''])

  return titlesByUrl
}
