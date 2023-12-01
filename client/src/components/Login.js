import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = () => {
    // Implement your login logic here
    console.log('Logging in with values:', { email, password });
    // Redirect to a dashboard or home page after successful login
    history.push('/dashboard');
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