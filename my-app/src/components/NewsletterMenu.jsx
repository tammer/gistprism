import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNewsletterData } from '../contexts/NewsletterDataContext'
import AddNewsletterModal from './AddNewsletterModal'
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

function MoreVerticalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  )
}

export default function NewsletterMenu() {
  const { rows, selectedUrl, setSelectedUrl, getLabel, getTitle, getUnreadCount, refreshNewsletter, removeUrl } =
    useNewsletterData()
  const [refreshingUrl, setRefreshingUrl] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)

  const handleRefresh = (e, url) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setRefreshingUrl(url)
    refreshNewsletter(url).finally(() => setRefreshingUrl(null))
  }

  const handleRemove = (e, id) => {
    e.stopPropagation()
    setOpenMenuId(null)
    removeUrl(id)
  }

  const toggleMenu = (e, rowId) => {
    e.stopPropagation()
    setOpenMenuId((prev) => (prev === rowId ? null : rowId))
  }

  const topCell = (
    <div className="newsletter-menu-add-cell">
      <button
        type="button"
        className="newsletter-menu-add-button"
        onClick={() => setModalOpen(true)}
        aria-label="Add newsletter"
      >
        Add Newsletter
      </button>
    </div>
  )

  if (rows.length === 0) {
    return (
      <div className="newsletter-menu">
        {topCell}
        <p className="newsletter-menu-empty">No newsletters.</p>
        <Link to="/newsletters" className="newsletter-menu-manage-link">
          Manage newsletters
        </Link>
        <AddNewsletterModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    )
  }

  const sortedRows = [...rows].sort(
    (a, b) => getUnreadCount(b.url) - getUnreadCount(a.url)
  )

  return (
    <nav className="newsletter-menu" aria-label="Newsletter list">
      {topCell}
      <ul className="newsletter-menu-list">
        {sortedRows.map((row) => {
          const unreadCount = getUnreadCount(row.url)
          const hasUnread = unreadCount > 0
          const isSelected = row.url === selectedUrl
          const isRefreshing = refreshingUrl === row.url
          return (
            <li key={row.id} className="newsletter-menu-cell-wrapper">
              <button
                type="button"
                className={`newsletter-menu-cell ${isSelected ? 'newsletter-menu-cell-selected' : ''}`}
                onClick={() => setSelectedUrl(row.url)}
                aria-pressed={isSelected}
                aria-label={`${getTitle(row.url)}, ${unreadCount} unread`}
              >
                <span className="newsletter-menu-cell-main">
                  <span
                    className={`newsletter-menu-cell-name ${
                      hasUnread ? 'newsletter-menu-cell-name-unread' : ''
                    }`}
                  >
                    {getTitle(row.url)}
                  </span>
                  <span className="newsletter-menu-cell-url">{row.url}</span>
                </span>
                <span className="newsletter-menu-cell-count">({unreadCount})</span>
              </button>
              <div className="newsletter-menu-cell-actions">
                <button
                  type="button"
                  className="newsletter-menu-cell-menu-trigger"
                  onClick={(e) => toggleMenu(e, row.id)}
                  aria-haspopup="true"
                  aria-expanded={openMenuId === row.id}
                  aria-label={`Actions for ${getTitle(row.url)}`}
                  title="Actions"
                >
                  <MoreVerticalIcon />
                </button>
                {openMenuId === row.id && (
                  <>
                    <div
                      className="newsletter-menu-dropdown-backdrop"
                      aria-hidden
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="newsletter-menu-dropdown" role="menu">
                      <button
                        type="button"
                        className="newsletter-menu-dropdown-item"
                        role="menuitem"
                        onClick={(e) => handleRefresh(e, row.url)}
                        disabled={isRefreshing}
                      >
                        <span className={`newsletter-menu-dropdown-item-icon ${isRefreshing ? 'newsletter-menu-dropdown-item-icon-spin' : ''}`}>
                          <RefreshIcon />
                        </span>
                        Refresh
                      </button>
                      <button
                        type="button"
                        className="newsletter-menu-dropdown-item newsletter-menu-dropdown-item-remove"
                        role="menuitem"
                        onClick={(e) => handleRemove(e, row.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <AddNewsletterModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </nav>
  )
}
