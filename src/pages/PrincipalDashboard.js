import React from 'react';
import './PrincipalDashboard.css';

function PrincipalDashboard({ user }) {
  if (!user || user.role !== 'principal') {
    return <p>Access Denied. Please log in as a principal.</p>;
  }

  return (
    <div className="principal-dashboard">
      <h2>Principal Dashboard - Welcome, {user.username}!</h2>
      <p>This is where you would view school-wide analytics and generate reports.</p>

      <h3>School Performance Overview</h3>
      <div className="kpi-cards">
        <div className="kpi-card">
          <h4>Total Students</h4>
          <p>500</p>
        </div>
        <div className="kpi-card">
          <h4>Average Score</h4>
          <p>78%</p>
        </div>
        <div className="kpi-card">
          <h4>Pass Rate</h4>
          <p>92%</p>
        </div>
      </div>

      <button>Generate School Report</button>
    </div>
  );
}

export default PrincipalDashboard;