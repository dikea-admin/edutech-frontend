import React, { useState } from 'react';
import './SchoolOnboarding.css';

function SchoolOnboarding({ user }) {
  // --- CORRECTED: useState calls are now at the top level, before any early returns ---
  const [schoolName, setSchoolName] = useState('');
  const [classesConfig, setClassesConfig] = useState('');
  const [principalEmail, setPrincipalEmail] = useState('');
  const [message, setMessage] = useState('');
  // ----------------------------------------------------------------------------------

  // Early return comes AFTER all hook calls
  if (!user || user.role !== 'admin') {
    return <p className="access-denied">Access Denied. Please log in as a School Onboarding Admin.</p>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Processing school onboarding...');
    // In a real app, this would be an API call to the backend
    setTimeout(() => {
      setMessage(`School "${schoolName}" onboarded successfully! Principal credentials sent to ${principalEmail}.`);
      setSchoolName('');
      setClassesConfig('');
      setPrincipalEmail('');
    }, 2000);
  };

  return (
    <div className="school-onboarding-page">
      <h2>School Onboarding - Welcome, {user.username}!</h2>
      <p>Use this interface to onboard new schools onto the platform.</p>

      <form onSubmit={handleSubmit} className="onboarding-form">
        <div className="form-group">
          <label htmlFor="schoolName">School Name:</label>
          <input
            type="text"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="classesConfig">Classes/Boards Configuration (e.g., 10th-CBSE, 11th-ICSE):</label>
          <textarea
            id="classesConfig"
            value={classesConfig}
            onChange={(e) => setClassesConfig(e.target.value)}
            rows="4"
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="principalEmail">Principal's Email for Credentials:</label>
          <input
            type="email"
            id="principalEmail"
            value={principalEmail}
            onChange={(e) => setPrincipalEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Onboard School</button>
      </form>
      {message && <p className="onboarding-message">{message}</p>}
    </div>
  );
}

export default SchoolOnboarding;