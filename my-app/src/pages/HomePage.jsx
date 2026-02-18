import { useEffect, useState } from 'react'
import { useNewsletterData } from '../contexts/NewsletterDataContext'

function formatArticleDate(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDate()
  const month = d.toLocaleDateString('en-GB', { month: 'short' })
  const year = d.getFullYear()
  return `${month} ${day}, ${year}`
}

export default function HomePage() {
  const {
    rows,
    selectedUrl,
    selectedPosts,
    selectedError,
    readPostIds,
    markAsRead,
    loading,
    error: urlsError,
    getTitle,
  } = useNewsletterData()

  const visiblePosts = (selectedPosts || []).filter((post) => !readPostIds.has(String(post.id)))
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!visiblePosts.length) {
      setCurrentIndex(0)
      return
    }

    setCurrentIndex((prev) => {
      if (prev >= visiblePosts.length) {
        return visiblePosts.length - 1
      }
      return prev
    })
  }, [visiblePosts.length])

  if (loading) {
    return <div className="app-loading">Loading…</div>
  }
  if (urlsError) {
    return <div className="app-error">Error: {urlsError}</div>
  }
  if (!rows.length) {
    return <div className="app-empty">No newsletters configured.</div>
  }

  if (!selectedUrl) {
    return <div className="app-loading">Loading…</div>
  }

  const newsletterTitle = getTitle(selectedUrl)

  if (selectedError) {
    return (
      <main className="home">
        <div className="newsletter-section error">
          Error loading {newsletterTitle}: {selectedError}
        </div>
      </main>
    )
  }

  if (!selectedPosts?.length) {
    return (
      <main className="home">
        <div className="newsletter-section empty">No posts for {newsletterTitle}</div>
      </main>
    )
  }

  const hasVisiblePosts = visiblePosts.length > 0
  const post = hasVisiblePosts ? visiblePosts[currentIndex] : null

  return (
    <main className="home">
      <div className="newsletter-section">
        <h2 className="newsletter-title">{newsletterTitle}</h2>
        {hasVisiblePosts && post && (
          <>
            <div className="article-nav">
              <button
                type="button"
                className="article-nav-button article-nav-prev"
                onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
                disabled={currentIndex === 0}
              >
                Previous article
              </button>
              <span className="article-position">
                Article {currentIndex + 1} of {visiblePosts.length}
              </span>
              <button
                type="button"
                className="article-nav-button article-nav-next"
                onClick={() =>
                  setCurrentIndex((index) =>
                    Math.min(index + 1, Math.max(visiblePosts.length - 1, 0)),
                  )
                }
                disabled={currentIndex === visiblePosts.length - 1}
              >
                Next article
              </button>
            </div>
            <ul className="post-list">
              <li key={post.id} className="post-item">
                <button
                  type="button"
                  className="post-delete"
                  onClick={() => {
                    markAsRead(post.id)
                    setCurrentIndex((prev) => {
                      if (visiblePosts.length <= 1) {
                        return 0
                      }
                      if (prev === visiblePosts.length - 1) {
                        return Math.max(visiblePosts.length - 2, 0)
                      }
                      return prev
                    })
                  }}
                  aria-label={`Done ${post.title}`}
                >
                  Done
                </button>
                {post.post_date && (
                  <time className="post-date" dateTime={post.post_date}>
                    {formatArticleDate(post.post_date)}
                  </time>
                )}
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
                  {post.title}
                </a>
                {post.summary?.short && (
                  <p className="post-summary post-summary-short">{post.summary.short}</p>
                )}
                {post.summary?.full && (
                  <p className="post-summary post-summary-full">{post.summary.full}</p>
                )}
              </li>
            </ul>
          </>
        )}
      </div>
    </main>
  )
}
