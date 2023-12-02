import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState('')
  const history = useHistory();

  const handleLogin = async () => {
    try {
      // Make a direct login request to the Express backend using fetch
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Assuming your backend sends a user object upon successful login
        const { user } = await response.json();

        console.log('Login successful:', user);

        // Redirect to a dashboard or home page after successful login
        history.push('/dashboard');
      } else {
        const responseData = await response.json();
        setInfo(responseData.message)
        // Handle login failure (show an error message, etc.)
      }
    } catch (error) {
      console.error('Login failed:', error);
      setInfo('Account login failed. Please try again.');
      // Handle login failure (show an error message, etc.)
    }
  };

  return (
    <div>
      <div>
        <h2>Login</h2>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button onClick={handleLogin}>Login</button>
        <p>{info}</p>
      </div>
      <div>
        <nav>
          <Link to="/create-account">Create Account</Link>
        </nav>
      </div>
    </div>
  );
};

export default Login;