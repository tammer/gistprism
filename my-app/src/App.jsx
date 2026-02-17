import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import LoginForm from './components/LoginForm'
import HomePage from './pages/HomePage'
import ManageNewsletters from './pages/ManageNewsletters'
import './App.css'

function App() {
  const { isSignedIn, loading: authLoading } = useAuth()

  let content

  if (authLoading) {
    content = <div className="app-loading">Loading…</div>
  } else if (!isSignedIn) {
    content = <LoginForm />
  } else {
    content = (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/newsletters" element={<ManageNewsletters />} />
      </Routes>
    )
  }

  return (
    <div className="app-layout">
      <NavBar />
      <div className="three-panes">
        <aside className="pane pane-left" aria-label="Left panel" />
        <main className="pane pane-middle">
          {content}
        </main>
        <aside className="pane pane-right" aria-label="Right panel" />
      </div>
    </div>
  )
}

export default App
