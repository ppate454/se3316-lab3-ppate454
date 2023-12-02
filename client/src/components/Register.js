import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [info, setInfo] = useState('')
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
        const responseData = await response.json();
        setInfo(responseData.message)
        console.log('Account created successfully');
        // Redirect to the login page after successful account creation
      } else {
        const responseData = await response.json();
        setInfo(responseData.message)
        console.error({info});
        // Handle account creation failure (show an error message, etc.)
      }
    } catch (error) {
      console.error('Account creation failed:', error);
      setInfo('Account creation failed. Please try again.');
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
      <p>{info}</p>
      <nav>
        <ul>
          <li><Link to="/login">Log In</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default CreateAccount;