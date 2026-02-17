import { useState, useEffect } from 'react'
import { API_BASE } from '../lib/api'

export function useAllNewsletterPosts(urls) {
  const [postsByUrl, setPostsByUrl] = useState(() => new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!urls?.length) {
      setPostsByUrl(new Map())
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const fetchOne = (newsletterUrl) => {
      const params = new URLSearchParams({ newsletter_url: newsletterUrl })
      return fetch(`${API_BASE}/api/posts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then((posts) => ({ posts, error: null }))
        .catch((err) => ({ posts: null, error: err.message }))
    }

    Promise.all(urls.map((url) => fetchOne(url))).then((results) => {
      if (cancelled) return
      const next = new Map()
      urls.forEach((url, i) => {
        next.set(url, results[i])
      })
      setPostsByUrl(next)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [urls?.length ? urls.join('\0') : ''])

  return { postsByUrl, loading }
}
