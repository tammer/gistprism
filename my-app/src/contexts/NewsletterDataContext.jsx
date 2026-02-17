import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { useNewsletterUrls } from '../hooks/useNewsletterUrls'
import { useReadPosts } from '../hooks/useReadPosts'
import { useAllNewsletterPosts } from '../hooks/useAllNewsletterPosts'

const NewsletterDataContext = createContext(null)

function getLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function NewsletterDataProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const { rows, urls, loading: urlsLoading, error: urlsError } = useNewsletterUrls(userId)
  const { readPostIds, markAsRead } = useReadPosts(userId)
  const { postsByUrl, loading: postsLoading } = useAllNewsletterPosts(urls)
  const [selectedUrl, setSelectedUrl] = useState(null)

  useEffect(() => {
    if (rows.length > 0 && selectedUrl === null) {
      setSelectedUrl(rows[0].url)
    }
  }, [rows, selectedUrl])

  const loading = urlsLoading || postsLoading
  const selectedEntry = selectedUrl ? postsByUrl.get(selectedUrl) : null
  const selectedPosts = selectedEntry?.posts ?? null
  const selectedError = selectedEntry?.error ?? null

  const getUnreadCount = (url) => {
    const entry = postsByUrl.get(url)
    if (!entry?.posts) return 0
    return entry.posts.filter((post) => !readPostIds.has(String(post.id))).length
  }

  const value = {
    rows,
    postsByUrl,
    readPostIds,
    markAsRead,
    selectedUrl,
    setSelectedUrl,
    loading,
    error: urlsError,
    getLabel,
    getUnreadCount,
    selectedPosts,
    selectedError,
  }

  return (
    <NewsletterDataContext.Provider value={value}>
      {children}
    </NewsletterDataContext.Provider>
  )
}

export function useNewsletterData() {
  const ctx = useContext(NewsletterDataContext)
  if (!ctx) {
    throw new Error('useNewsletterData must be used within NewsletterDataProvider')
  }
  return ctx
}
