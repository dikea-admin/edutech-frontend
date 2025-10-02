import React from 'react';
import './TeacherDashboard.css';

function TeacherDashboard({ user }) {
  if (!user || user.role !== 'teacher') {
    return <p>Access Denied. Please log in as a teacher.</p>;
  }

  return (
    <div className="teacher-dashboard">
      <h2>Teacher Dashboard - Welcome, {user.username}!</h2>
      <p>This is where you would manage your classes, view student progress, and grade assignments.</p>

      <h3>Your Classes</h3>
      <div className="class-cards">
        <div className="class-card">
          <h4>10th Grade - Physics</h4>
          <p>30 Students</p>
          <button>View Class</button>
        </div>
        <div className="class-card">
          <h4>9th Grade - Math</h4>
          <p>28 Students</p>
          <button>View Class</button>
        </div>
      </div>

      <h3>Outstanding Tasks</h3>
      <ul>
        <li>Grade Algebra II Quiz for 10th Grade</li>
        <li>Review Chapter 3 Essays for 9th Grade Physics</li>
      </ul>
      <button>Go to Grading</button>
    </div>
  );
}

export default TeacherDashboard;