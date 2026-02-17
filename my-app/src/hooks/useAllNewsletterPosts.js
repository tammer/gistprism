import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../lib/api'

function fetchPostsForUrl(newsletterUrl) {
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

    Promise.all(urls.map((url) => fetchPostsForUrl(url))).then((results) => {
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

  const refetchOne = useCallback((url) => {
    return fetchPostsForUrl(url).then((result) => {
      setPostsByUrl((prev) => {
        const next = new Map(prev)
        next.set(url, result)
        return next
      })
      return result
    })
  }, [])

  return { postsByUrl, loading, refetchOne }
}
