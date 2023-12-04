import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

const UpdatePassword = () => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [info, setInfo] = useState('')

  const handleUpdatePassword = async () => {
    try {
      const response = await fetch('/api/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setInfo(data.message);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  return (
    <div>
      <h2>Update Password</h2>
      <label>Email:</label>
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <label>Current Password:</label>
      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <br />
      <label>New Password:</label>
      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <br />
      <button onClick={handleUpdatePassword}>Update Password</button>
      <p>{info}</p>
      <div>
        <nav>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </div>
  );
};

export default UpdatePassword;