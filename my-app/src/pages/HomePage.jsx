import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useReadPosts } from '../hooks/useReadPosts'
import { useNewsletterUrls } from '../hooks/useNewsletterUrls'

const API_BASE = 'http://127.0.0.1:5001'

function NewsletterSection({ newsletterUrl, readPostIds, onMarkRead }) {
  const [posts, setPosts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams({
      newsletter_url: newsletterUrl,
    })
    fetch(`${API_BASE}/api/posts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [newsletterUrl])

  const label = new URL(newsletterUrl).hostname.replace(/^www\./, '')

  if (loading) return <div className="newsletter-section loading">Loading {label}…</div>
  if (error) return <div className="newsletter-section error">Error loading {label}: {error}</div>
  if (!posts?.length) return <div className="newsletter-section empty">No posts for {label}</div>

  const visiblePosts = posts.filter((post) => !readPostIds.has(String(post.id)))

  return (
    <div className="newsletter-section">
      <h2 className="newsletter-title">{label}</h2>
      <ul className="post-list">
        {visiblePosts.map((post) => (
          <li key={post.id} className="post-item">
            <button
              type="button"
              className="post-delete"
              onClick={() => onMarkRead(post.id)}
              aria-label={`Done ${post.title}`}
            >
              Done
            </button>
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
              {post.title}
            </a>
            {post.post_date && (
              <time className="post-date" dateTime={post.post_date}>
                {new Date(post.post_date).toLocaleDateString()}
              </time>
            )}
            {post.summary?.short && (
              <p className="post-summary post-summary-short">{post.summary.short}</p>
            )}
            {post.summary?.full && (
              <p className="post-summary post-summary-full">{post.summary.full}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const { urls, loading: urlsLoading, error: urlsError } = useNewsletterUrls(user?.id)
  const { readPostIds, markAsRead } = useReadPosts(user?.id)

  if (urlsLoading) {
    return <div className="app-loading">Loading…</div>
  }
  if (urlsError) {
    return <div className="app-error">Error: {urlsError}</div>
  }
  if (!urls.length) {
    return <div className="app-empty">No newsletters configured.</div>
  }

  return (
    <main className="home">
      <h1>Newsletter posts</h1>
      <div className="newsletter-grid">
        {urls.map((url) => (
          <NewsletterSection
            key={url}
            newsletterUrl={url}
            readPostIds={readPostIds}
            onMarkRead={markAsRead}
          />
        ))}
      </div>
    </main>
  )
}
