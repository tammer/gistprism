import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './LoginForm.css'

export default function LoginForm() {
  const { signInWithPassword, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password)
      } else {
        await signUp(email, password)
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-form-wrap">
      <div className="login-form-card">
        <h2 className="login-form-title">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-form-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="login-form-input"
            />
          </label>
          <label className="login-form-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="login-form-input"
            />
          </label>
          {error && <p className="login-form-error" role="alert">{error}</p>}
          {message && <p className="login-form-message" role="status">{message}</p>}
          <button type="submit" className="login-form-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>
        <p className="login-form-toggle">
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <button
                type="button"
                className="login-form-toggle-btn"
                onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="login-form-toggle-btn"
                onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
