import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import SchoolOnboarding from './pages/admin/SchoolOnboarding';
import Navbar from './components/Navbar';
import './App.css'; // App-specific CSS

function App() {
  const [user, setUser] = useState(null); // user state for authentication (null, student, teacher, principal, admin)

  const handleLogin = (username, password, role) => {
    // In a real app, you'd send these to a backend API for validation
    // For this example, we'll simulate a successful login
    if (username && password) { // Simple check
      setUser({ username, role });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

            {/* Protected Routes */}
            {user && user.role === 'student' && (
              <Route path="/student/dashboard" element={<StudentDashboard user={user} />} />
            )}
            {user && user.role === 'teacher' && (
              <Route path="/teacher/dashboard" element={<TeacherDashboard user={user} />} />
            )}
            {user && user.role === 'principal' && (
              <Route path="/principal/dashboard" element={<PrincipalDashboard user={user} />} />
            )}
            {user && user.role === 'admin' && (
              <Route path="/admin/onboarding" element={<SchoolOnboarding user={user} />} />
            )}

            {/* Redirect if not logged in or unauthorized for a specific route */}
            <Route path="*" element={user ? <p>404 - Page Not Found</p> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;