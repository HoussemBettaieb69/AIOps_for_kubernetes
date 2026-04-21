import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatProvider, useChatContext } from "./pages/ChatContext.jsx";
import Login from "./pages/login.jsx";
import UserManagement from "./pages/user_managment.jsx";
import Alerts from "./pages/alerts.jsx";
import Dashboard from "./pages/DashboardPage.jsx";
import AlertDetail from "./pages/AlertDetail.jsx";
import Sidebar from "./components/sidebar.jsx";
import AIChat from "./components/AIChat.jsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/alerts" />;
  return children;
}

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const { alertContext } = useChatContext();

  return (
    <div className="flex bg-black min-h-screen">
      {!isLoginPage && <Sidebar />}

      <main className={`flex-1 ${!isLoginPage ? "ml-40" : ""}`}>
        <Outlet />
      </main>

      {!isLoginPage && <AIChat alertContext={alertContext} />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ChatProvider>
          <Routes>
            {/* Layout wrapper */}
            <Route element={<AppLayout />}>
              <Route path="/login" element={<Login />} />

              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <Alerts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/incidents/:id"
                element={
                  <ProtectedRoute>
                    <AlertDetail type="incident" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/predictions/:id"
                element={
                  <ProtectedRoute>
                    <AlertDetail type="prediction" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/user_management"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/login" />} />
            </Route>
          </Routes>
        </ChatProvider>
      </Router>
    </QueryClientProvider>
  );
}
export default App;
