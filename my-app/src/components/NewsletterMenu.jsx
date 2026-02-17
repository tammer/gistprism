import { Link } from 'react-router-dom'
import { useNewsletterData } from '../contexts/NewsletterDataContext'
import './NewsletterMenu.css'

export default function NewsletterMenu() {
  const { rows, selectedUrl, setSelectedUrl, getLabel, getUnreadCount } = useNewsletterData()

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
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
