import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const noop = () => {}

export function useReadPosts(userId) {
  const [readPostIds, setReadPostIds] = useState(() => new Set())

  useEffect(() => {
    if (!userId) {
      setReadPostIds(new Set())
      return
    }

    let cancelled = false

    supabase
      .from('read_posts')
      .select('post_id')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Failed to load read posts:', error)
          return
        }
        setReadPostIds(new Set((data ?? []).map((row) => row.post_id)))
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const markAsRead = useCallback(
    (postId) => {
      if (!userId) return

      const id = String(postId)
      setReadPostIds((prev) => new Set([...prev, id]))

      supabase
        .from('read_posts')
        .insert({ user_id: userId, post_id: id })
        .then(({ error }) => {
          if (error) {
            console.error('Failed to mark post as read:', error)
            setReadPostIds((prev) => {
              const next = new Set(prev)
              next.delete(id)
              return next
            })
          }
        })
    },
    [userId]
  )

  if (!userId) {
    return { readPostIds: new Set(), markAsRead: noop }
  }

  return { readPostIds, markAsRead }
}
