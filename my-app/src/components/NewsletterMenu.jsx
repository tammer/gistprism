import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNewsletterData } from '../contexts/NewsletterDataContext'
import './NewsletterMenu.css'

function RefreshIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  )
}

export default function NewsletterMenu() {
  const { rows, selectedUrl, setSelectedUrl, getLabel, getUnreadCount, refreshNewsletter } =
    useNewsletterData()
  const [refreshingUrl, setRefreshingUrl] = useState(null)

  const handleRefresh = (e, url) => {
    e.stopPropagation()
    setRefreshingUrl(url)
    refreshNewsletter(url).finally(() => setRefreshingUrl(null))
  }

  if (rows.length === 0) {
    return (
      <div className="newsletter-menu">
        <p className="newsletter-menu-empty">No newsletters.</p>
        <Link to="/newsletters" className="newsletter-menu-manage-link">
          Manage newsletters
        </Link>
      </div>
    )
  }

  return (
    <nav className="newsletter-menu" aria-label="Newsletter list">
      <ul className="newsletter-menu-list">
        {rows.map((row) => {
          const unreadCount = getUnreadCount(row.url)
          const isSelected = row.url === selectedUrl
          const isRefreshing = refreshingUrl === row.url
          return (
            <li key={row.id} className="newsletter-menu-cell-wrapper">
              <button
                type="button"
                className={`newsletter-menu-cell ${isSelected ? 'newsletter-menu-cell-selected' : ''}`}
                onClick={() => setSelectedUrl(row.url)}
                aria-pressed={isSelected}
                aria-label={`${getLabel(row.url)}, ${unreadCount} unread`}
              >
                <span className="newsletter-menu-cell-name">{getLabel(row.url)}</span>
                <span className="newsletter-menu-cell-count">
                  {unreadCount} unread
                </span>
              </button>
              <button
                type="button"
                className={`newsletter-menu-cell-refresh ${isRefreshing ? 'newsletter-menu-cell-refresh-spin' : ''}`}
                onClick={(e) => handleRefresh(e, row.url)}
                disabled={isRefreshing}
                aria-label={`Refresh ${getLabel(row.url)}`}
                title="Refresh articles"
              >
                <RefreshIcon />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
