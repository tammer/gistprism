import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useNewsletterUrls(userId) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setRows([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    supabase
      .from('newsletter_urls')
      .select('id, url')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          setRows([])
          return
        }
        setRows(data ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const addUrl = useCallback(
    async (url) => {
      if (!userId || !url?.trim()) return { error: 'URL is required' }
      const trimmed = url.trim()
      const { data, error: err } = await supabase
        .from('newsletter_urls')
        .insert({ user_id: userId, url: trimmed })
        .select('id, url')
        .single()
      if (err) {
        if (err.code === '23505') return { error: 'This URL is already in your list' }
        return { error: err.message }
      }
      if (data) setRows((prev) => [...prev, data])
      return {}
    },
    [userId]
  )

  const removeUrl = useCallback(
    async (id) => {
      if (!userId) return { error: 'Not signed in' }
      const { error: err } = await supabase.from('newsletter_urls').delete().eq('id', id).eq('user_id', userId)
      if (err) return { error: err.message }
      setRows((prev) => prev.filter((r) => r.id !== id))
      return {}
    },
    [userId]
  )

  const urls = rows.map((r) => r.url)

  return {
    urls,
    rows,
    loading,
    error,
    addUrl,
    removeUrl,
  }
}
