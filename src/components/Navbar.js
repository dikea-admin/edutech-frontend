import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">EduSpark</Link>
      </div>
      <ul className="navbar-links">
        {user ? (
          <>
            <li>Welcome, {user.username} ({user.role})</li>
            <li>
              <button onClick={onLogout} className="logout-btn">Logout</button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;