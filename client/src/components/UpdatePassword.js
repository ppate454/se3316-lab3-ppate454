import React, { useState } from 'react';

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdatePassword = () => {
    // Implement your password update logic here
    console.log('Updating password with values:', { currentPassword, newPassword });
    // You might want to use a service or API to handle password updates
  };

  return (
    <div>
      <h2>Update Password</h2>
      <label>Current Password:</label>
      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <br />
      <label>New Password:</label>
      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <br />
      <button onClick={handleUpdatePassword}>Update Password</button>
    </div>
  );
};

export default UpdatePassword;