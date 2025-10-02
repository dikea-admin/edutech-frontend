import React from 'react';
import './StudentDashboard.css';

function StudentDashboard({ user }) {
  if (!user || user.role !== 'student') {
    return <p>Access Denied. Please log in as a student.</p>;
  }

  const courses = [
    { id: 1, title: 'Mathematics - Algebra I', progress: 75, next: 'Chapter 5: Equations' },
    { id: 2, title: 'Physics - Mechanics', progress: 60, next: 'Chapter 3: Forces' },
    { id: 3, title: 'Chemistry - Basic Concepts', progress: 40, next: 'Chapter 2: Atoms' },
  ];

  const recommendedChapters = [
    { id: 101, title: 'Geometry Basics', course: 'Mathematics' },
    { id: 102, title: 'Work & Energy', course: 'Physics' },
  ];

  const upcomingAssessments = [
    { id: 201, title: 'Algebra Midterm', date: '2023-11-15', status: 'Pending' },
    { id: 202, title: 'Chemistry Quiz 1', date: '2023-11-10', status: 'Due Soon' },
  ];

  return (
    <div className="student-dashboard">
      <h2>Welcome back, {user.username}!</h2>

      <section className="dashboard-section">
        <h3>Your Progress</h3>
        <div className="progress-cards">
          {courses.map(course => (
            <div key={course.id} className="progress-card">
              <h4>{course.title}</h4>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
              </div>
              <p>{course.progress}% Completed</p>
              <p>Next: {course.next}</p>
              <button className="btn-continue">Continue Learning</button>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h3>Recommended Chapters</h3>
        <div className="recommended-list">
          {recommendedChapters.map(chapter => (
            <div key={chapter.id} className="recommended-item">
              <span>{chapter.title} - {chapter.course}</span>
              <button className="btn-view">View</button>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h3>Upcoming Assessments</h3>
        <div className="assessment-list">
          {upcomingAssessments.map(assessment => (
            <div key={assessment.id} className="assessment-item">
              <span>{assessment.title} (Due: {assessment.date}) - Status: {assessment.status}</span>
              <button className="btn-start">Start Exam</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;