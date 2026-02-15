import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://127.0.0.1:5001'

function NewsletterSection({ newsletterUrl }) {
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

  return (
    <div className="newsletter-section">
      <h2 className="newsletter-title">{label}</h2>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id} className="post-item">
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

function App() {
  const [urls, setUrls] = useState([])
  const [urlsLoading, setUrlsLoading] = useState(true)
  const [urlsError, setUrlsError] = useState(null)

  useEffect(() => {
    fetch('/data/urls.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load URLs')
        return res.json()
      })
      .then(setUrls)
      .catch((err) => setUrlsError(err.message))
      .finally(() => setUrlsLoading(false))
  }, [])

  if (urlsLoading) return <div className="app-loading">Loading…</div>
  if (urlsError) return <div className="app-error">Error: {urlsError}</div>
  if (!urls.length) return <div className="app-empty">No newsletters configured.</div>

  return (
    <main className="home">
      <h1>Newsletter posts</h1>
      <div className="newsletter-grid">
        {urls.map((url) => (
          <NewsletterSection key={url} newsletterUrl={url} />
        ))}
      </div>
    </main>
  )
}

export default App
