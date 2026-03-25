import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx';
import UserManagement from './pages/user_managment.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/user_management" element={<UserManagement />} />

            {/* Default redirect/ */}
            <Route path="/" element={<Navigate to="/user_management" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;