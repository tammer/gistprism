import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './NavBar.css'

export default function NavBar() {
  const { user, signOut, isSignedIn } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setMenuOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          GistPrism
        </Link>
        <div className="navbar-actions">
          {isSignedIn ? (
            <>
              <Link to="/newsletters" className="navbar-link">Newsletters</Link>
              <button
                type="button"
                className="navbar-user-trigger"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <span className="navbar-user-email">{user?.email}</span>
                <span className="navbar-user-chevron" aria-hidden>▼</span>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="navbar-backdrop"
                    aria-hidden
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="navbar-dropdown">
                    <span className="navbar-dropdown-email">{user?.email}</span>
                    <button type="button" className="navbar-dropdown-signout" onClick={handleSignOut}>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <Link to="/" className="navbar-login-link">
              Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
