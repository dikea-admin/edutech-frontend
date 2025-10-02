import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Page-specific CSS

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Simulate different roles for testing:
    // student/student, teacher/teacher, principal/principal, admin/admin
    if (onLogin(username, password, role)) {
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else if (role === 'principal') navigate('/principal/dashboard');
      else if (role === 'admin') navigate('/admin/onboarding');
    } else {
      setError('Invalid username, password, or role.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login to EduSpark</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Login as:</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="principal">Principal</option>
              <option value="admin">School Onboarding Admin</option>
            </select>
          </div>
          <button type="submit">Login</button>
        </form>
        <p className="hint-text">
          Hint: Use username/password as role (e.g., student/student)
        </p>
      </div>
    </div>
  );
}

export default LoginPage;