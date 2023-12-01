import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const history = useHistory();

  const handleCreateAccount = async () => {
    try {
      // Make a direct registration request to the Express backend using fetch
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username: nickname }),
      });

      if (response.ok) {
        console.log('Account created successfully');
        // Redirect to the login page after successful account creation
        history.push('/login');
      } else {
        const errorData = await response.json();
        console.error('Account creation failed:', errorData.message);
        // Handle account creation failure (show an error message, etc.)
      }
    } catch (error) {
      console.error('Account creation failed:', error);
      // Handle account creation failure (show an error message, etc.)
    }
  };

  return (
    <div>
      <h2>Create Account</h2>
      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <label>Password:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <br />
      <label>Username:</label>
      <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <br />
      <button onClick={handleCreateAccount}>Create Account</button>
    </div>
  );
};

export default CreateAccount;