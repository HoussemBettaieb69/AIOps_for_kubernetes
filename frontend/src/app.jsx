import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/login.jsx'
import UserManagement from './pages/user_managment.jsx'
import Alerts from './pages/alerts.jsx'
import Dashboard from './pages/DashboardPage.jsx'
import ChatHistoryPage from './pages/ChatHistory.jsx'
import AlertDetail from './pages/AlertDetail.jsx'
import Sidebar from './components/sidebar.jsx'
import AIButton from './components/AIButton.jsx'
import AIChatWindow from './components/AIChatWindow.jsx'

function ProtectedRoute({ children, adminOnly = false }) {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) return <Navigate to="/login" />
  if (adminOnly && !user.isAdmin) return <Navigate to="/alerts" />
  return children
}

function AppLayout({ children }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const [open, setOpen] = useState(false)
  return (
    <div className="flex bg-black min-h-screen">
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 ${!isLoginPage ? 'ml-40' : ''}`}>
        {children}
      </main>
      {!isLoginPage && (
        <>
          <AIButton mode="general" onClick={() => setOpen(true)} />
          {open && <AIChatWindow mode="general" onClose={() => setOpen(false)} />}
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/alerts" element={
            <ProtectedRoute><Alerts /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/chat_history" element={
            <ProtectedRoute><ChatHistoryPage /></ProtectedRoute>
          } />
          <Route path="/incidents/:id" element={
            <ProtectedRoute><AlertDetail type="incident" /></ProtectedRoute>
          } />
          <Route path="/predictions/:id" element={
            <ProtectedRoute><AlertDetail type="prediction" /></ProtectedRoute>
          } />
          <Route path="/user_management" element={
            <ProtectedRoute adminOnly={true}><UserManagement /></ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App