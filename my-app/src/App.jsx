import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import LoginForm from './components/LoginForm'
import HomePage from './pages/HomePage'
import ManageNewsletters from './pages/ManageNewsletters'
import './App.css'

function App() {
  const { user, isSignedIn, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <>
        <NavBar />
        <div className="app-loading">Loading…</div>
      </>
    )
  }

  if (!isSignedIn) {
    return (
      <>
        <NavBar />
        <LoginForm />
      </>
    )
  }

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/newsletters" element={<ManageNewsletters />} />
      </Routes>
    </>
  )
}

export default App
