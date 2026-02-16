import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNewsletterUrls } from '../hooks/useNewsletterUrls'

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export default function ManageNewsletters() {
  const { user } = useAuth()
  const { rows, loading, error, addUrl, removeUrl } = useNewsletterUrls(user?.id)
  const [inputValue, setInputValue] = useState('')
  const [addError, setAddError] = useState(null)
  const [addSuccess, setAddSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAddError(null)
    setAddSuccess(false)
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setAddError('Please enter a URL')
      return
    }
    if (!isValidUrl(trimmed)) {
      setAddError('Please enter a valid URL')
      return
    }
    const result = await addUrl(trimmed)
    if (result.error) {
      setAddError(result.error)
      return
    }
    setInputValue('')
    setAddSuccess(true)
  }

  const handleRemove = async (id) => {
    setAddError(null)
    await removeUrl(id)
  }

  if (loading) {
    return <main className="manage-newsletters"><div className="app-loading">Loading…</div></main>
  }
  if (error) {
    return <main className="manage-newsletters"><div className="app-error">Error: {error}</div></main>
  }

  return (
    <main className="manage-newsletters">
      <h1>Manage newsletters</h1>
      <p className="manage-newsletters-intro">Add or remove newsletter URLs. These feed your home page.</p>

      <form onSubmit={handleSubmit} className="manage-newsletters-form">
        <label htmlFor="newsletter-url">Newsletter URL</label>
        <div className="manage-newsletters-form-row">
          <input
            id="newsletter-url"
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.substack.com/"
            className="manage-newsletters-input"
            autoComplete="url"
          />
          <button type="submit" className="manage-newsletters-add">Add</button>
        </div>
        {addError && <p className="manage-newsletters-message error" role="alert">{addError}</p>}
        {addSuccess && <p className="manage-newsletters-message success">URL added.</p>}
      </form>

      <section className="manage-newsletters-list" aria-label="Your newsletter URLs">
        <h2>Your newsletters</h2>
        {rows.length === 0 ? (
          <p className="manage-newsletters-empty">No newsletters yet. Add one above.</p>
        ) : (
          <ul className="manage-newsletters-url-list">
            {rows.map(({ id, url }) => (
              <li key={id} className="manage-newsletters-url-item">
                <a href={url} target="_blank" rel="noopener noreferrer" className="manage-newsletters-url-link">
                  {url}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="manage-newsletters-remove"
                  aria-label={`Remove ${url}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
