import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/login.jsx'
import UserManagement from './pages/user_managment.jsx'
import Alerts from './pages/alerts.jsx'
import Sidebar from './components/sidebar.jsx'

function ProtectedRoute({ children, adminOnly = false }) {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) return <Navigate to="/login" />
  if (adminOnly && !user.isAdmin) return <Navigate to="/alerts" />
  return children
}

function AppLayout({ children }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  return (
    <div className="flex bg-black min-h-screen">
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 ${!isLoginPage ? 'ml-40' : ''}`}>
        {children}
      </main>
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