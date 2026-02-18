import { useState, useEffect, useRef } from 'react'
import { useNewsletterData } from '../contexts/NewsletterDataContext'
import { API_BASE } from '../lib/api'
import './AddNewsletterModal.css'

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

async function fetchRecommendations(newsletterUrl) {
  const params = new URLSearchParams({ newsletter_url: newsletterUrl })
  const res = await fetch(`${API_BASE}/api/recommendations/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const list = Array.isArray(data) ? data : data?.recommendations ?? []
  return list.map((item) => {
    if (typeof item === 'string') {
      return { url: item, title: item, subtitle: '' }
    }
    if (item == null || !item.url) return null
    return {
      url: item.url,
      title: item.title ?? item.name ?? item.url,
      subtitle: item.subtitle ?? '',
    }
  }).filter(Boolean)
}

const MODE_DIRECT = 'direct'
const MODE_RECOMMENDATIONS = 'recommendations'

export default function AddNewsletterModal({ open, onClose }) {
  const { rows, urls, getTitle, addUrl } = useNewsletterData()
  const [mode, setMode] = useState(MODE_DIRECT)
  const [directUrl, setDirectUrl] = useState('')
  const [directError, setDirectError] = useState(null)
  const [directSuccess, setDirectSuccess] = useState(false)
  const [sourceUrl, setSourceUrl] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState(null)
  const [selectedUrls, setSelectedUrls] = useState(new Set())
  const [addSelectedError, setAddSelectedError] = useState(null)
  const [adding, setAdding] = useState(false)
  const dialogRef = useRef(null)

  const subscribedSet = new Set(urls ?? [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const handleClose = () => onClose?.()
    dialog?.addEventListener('close', handleClose)
    return () => dialog?.removeEventListener('close', handleClose)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setDirectUrl('')
      setDirectError(null)
      setDirectSuccess(false)
      setSourceUrl('')
      setRecommendations([])
      setRecommendationsError(null)
      setSelectedUrls(new Set())
      setAddSelectedError(null)
    }
  }, [open])

  const handleDirectSubmit = async (e) => {
    e.preventDefault()
    setDirectError(null)
    setDirectSuccess(false)
    const trimmed = directUrl.trim()
    if (!trimmed) {
      setDirectError('Please enter a URL')
      return
    }
    if (!isValidUrl(trimmed)) {
      setDirectError('Please enter a valid URL')
      return
    }
    const result = await addUrl(trimmed)
    if (result.error) {
      setDirectError(result.error)
      return
    }
    setDirectUrl('')
    setDirectSuccess(true)
  }

  const handleSelectSource = async (e) => {
    const url = e.target.value
    setSourceUrl(url)
    if (!url) {
      setRecommendations([])
      setRecommendationsError(null)
      return
    }
    setRecommendationsLoading(true)
    setRecommendationsError(null)
    setRecommendations([])
    setSelectedUrls(new Set())
    try {
      const list = await fetchRecommendations(url)
      setRecommendations(list.filter((item) => !subscribedSet.has(item.url)))
    } catch (err) {
      setRecommendationsError(err.message || 'Failed to load recommendations')
      setRecommendations([])
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const toggleSelected = (url) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  const selectAll = () => {
    if (selectedUrls.size === recommendations.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(recommendations.map((r) => r.url)))
    }
  }

  const handleAddSelected = async (e) => {
    e.preventDefault()
    if (selectedUrls.size === 0) return
    setAddSelectedError(null)
    setAdding(true)
    const toAdd = [...selectedUrls]
    const errors = []
    for (const url of toAdd) {
      const result = await addUrl(url)
      if (result.error) errors.push({ url, error: result.error })
    }
    setAdding(false)
    if (errors.length > 0) {
      setAddSelectedError(errors.map((e) => `${e.url}: ${e.error}`).join('; '))
    } else {
      setSelectedUrls(new Set())
      setRecommendations((prev) => prev.filter((r) => !toAdd.includes(r.url)))
    }
  }

  const filteredRecommendations = recommendations

  return (
    <dialog
      ref={dialogRef}
      className="add-newsletter-modal"
      onCancel={onClose}
      aria-labelledby="add-newsletter-modal-title"
      aria-modal="true"
    >
      <div className="add-newsletter-modal-content">
        <h2 id="add-newsletter-modal-title" className="add-newsletter-modal-title">
          Add Newsletter
        </h2>

        <div className="add-newsletter-modal-tabs" role="tablist" aria-label="Add method">
          <button
            type="button"
            role="tab"
            aria-selected={mode === MODE_DIRECT}
            aria-controls="add-newsletter-direct-panel"
            id="add-newsletter-direct-tab"
            className={`add-newsletter-modal-tab ${mode === MODE_DIRECT ? 'add-newsletter-modal-tab-active' : ''}`}
            onClick={() => setMode(MODE_DIRECT)}
          >
            Paste URL
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === MODE_RECOMMENDATIONS}
            aria-controls="add-newsletter-recommendations-panel"
            id="add-newsletter-recommendations-tab"
            className={`add-newsletter-modal-tab ${mode === MODE_RECOMMENDATIONS ? 'add-newsletter-modal-tab-active' : ''}`}
            onClick={() => setMode(MODE_RECOMMENDATIONS)}
          >
            From recommendations
          </button>
        </div>

        {mode === MODE_DIRECT && (
          <div
            id="add-newsletter-direct-panel"
            role="tabpanel"
            aria-labelledby="add-newsletter-direct-tab"
            className="add-newsletter-modal-panel"
          >
            <form onSubmit={handleDirectSubmit} className="add-newsletter-form">
              <label htmlFor="add-newsletter-url">Newsletter URL</label>
              <input
                id="add-newsletter-url"
                type="url"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="https://example.substack.com/"
                className="add-newsletter-input"
                autoComplete="url"
                aria-invalid={!!directError}
                aria-describedby={directError ? 'add-newsletter-direct-error' : undefined}
              />
              {directError && (
                <p id="add-newsletter-direct-error" className="add-newsletter-message add-newsletter-message-error" role="alert">
                  {directError}
                </p>
              )}
              {directSuccess && (
                <p className="add-newsletter-message add-newsletter-message-success">URL added.</p>
              )}
              <button type="submit" className="add-newsletter-submit">Add</button>
            </form>
          </div>
        )}

        {mode === MODE_RECOMMENDATIONS && (
          <div
            id="add-newsletter-recommendations-panel"
            role="tabpanel"
            aria-labelledby="add-newsletter-recommendations-tab"
            className="add-newsletter-modal-panel"
          >
            {rows.length === 0 ? (
              <p className="add-newsletter-recommendations-empty">
                Add at least one newsletter (using &quot;Paste URL&quot;) to see recommendations from it.
              </p>
            ) : (
              <>
                <label htmlFor="add-newsletter-source">Recommendations from</label>
                <select
                  id="add-newsletter-source"
                  value={sourceUrl}
                  onChange={handleSelectSource}
                  className="add-newsletter-select"
                  aria-describedby={recommendationsError ? 'add-newsletter-recommendations-error' : undefined}
                >
                  <option value="">Choose a newsletter…</option>
                  {rows.map((row) => (
                    <option key={row.id} value={row.url}>
                      {getTitle(row.url)}
                    </option>
                  ))}
                </select>
                {recommendationsError && (
                  <p id="add-newsletter-recommendations-error" className="add-newsletter-message add-newsletter-message-error" role="alert">
                    {recommendationsError}
                  </p>
                )}
                {recommendationsLoading && (
                  <p className="add-newsletter-loading">Loading recommendations…</p>
                )}
                {!recommendationsLoading && sourceUrl && filteredRecommendations.length === 0 && !recommendationsError && (
                  <p className="add-newsletter-recommendations-empty">
                    No new recommendations, or you’re already subscribed to all of them.
                  </p>
                )}
                {!recommendationsLoading && filteredRecommendations.length > 0 && (
                  <div className="add-newsletter-recommendations-list-wrap">
                    <button
                      type="button"
                      className="add-newsletter-select-all"
                      onClick={selectAll}
                    >
                      {selectedUrls.size === filteredRecommendations.length ? 'Deselect all' : 'Select all'}
                    </button>
                    <ul className="add-newsletter-recommendations-list" role="list">
                      {filteredRecommendations.map((rec) => (
                        <li key={rec.url} className="add-newsletter-recommendation-item">
                          <label className="add-newsletter-recommendation-label">
                            <input
                              type="checkbox"
                              checked={selectedUrls.has(rec.url)}
                              onChange={() => toggleSelected(rec.url)}
                              className="add-newsletter-checkbox"
                            />
                            <span className="add-newsletter-recommendation-text">
                              <span className="add-newsletter-recommendation-title">{rec.title}</span>
                              {rec.subtitle && (
                                <span className="add-newsletter-recommendation-subtitle">{rec.subtitle}</span>
                              )}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {addSelectedError && (
                      <p className="add-newsletter-message add-newsletter-message-error" role="alert">
                        {addSelectedError}
                      </p>
                    )}
                    <button
                      type="button"
                      className="add-newsletter-submit"
                      disabled={selectedUrls.size === 0 || adding}
                      onClick={handleAddSelected}
                    >
                      {adding ? 'Adding…' : `Add selected (${selectedUrls.size})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <button
          type="button"
          className="add-newsletter-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
      </div>
    </dialog>
  )
}
