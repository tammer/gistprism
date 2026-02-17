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
    getLabel,
  } = useNewsletterData()

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

  const label = getLabel(selectedUrl)

  if (selectedError) {
    return (
      <main className="home">
        <div className="newsletter-section error">
          Error loading {label}: {selectedError}
        </div>
      </main>
    )
  }

  if (!selectedPosts?.length) {
    return (
      <main className="home">
        <div className="newsletter-section empty">No posts for {label}</div>
      </main>
    )
  }

  const visiblePosts = selectedPosts.filter((post) => !readPostIds.has(String(post.id)))

  return (
    <main className="home">
      <h1>Newsletter posts</h1>
      <div className="newsletter-section">
        <h2 className="newsletter-title">{label}</h2>
        <ul className="post-list">
          {visiblePosts.map((post) => (
            <li key={post.id} className="post-item">
              <button
                type="button"
                className="post-delete"
                onClick={() => markAsRead(post.id)}
                aria-label={`Done ${post.title}`}
              >
                Done
              </button>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
                {post.title}
              </a>
              {post.post_date && (
                <time className="post-date" dateTime={post.post_date}>
                  {formatArticleDate(post.post_date)}
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
    </main>
  )
}
