import { BrowserRouter as Router, Routes, Route, Navigate , useLocation } from 'react-router-dom';
import Login from './pages/login.jsx';
import UserManagement from './pages/user_managment.jsx';
import Alerts from './pages/alerts.jsx';
import Sidebar from './components/sidebar.jsx';

function AppLayout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex bg-black min-h-screen">
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 ${!isLoginPage ? 'ml-45' : ''}`}>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
        <AppLayout>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/user_management" element={<UserManagement />} />
            <Route path='/alerts' element={<Alerts/>} />

            {/* Default redirect/ */}
            <Route path="/" element={<Navigate to="/user_management" />} />
          </Routes>
        </div>
      </div>
      </AppLayout>
    </Router>
  );
}

export default App;