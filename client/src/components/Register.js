import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const history = useHistory();

  const handleCreateAccount = () => {
    // Implement your account creation logic here
    console.log('Creating account with values:', { email, password, nickname });
    // Redirect to the login page after account creation
    history.push('/login');
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
      <label>Nickname:</label>
      <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <br />
      <button onClick={handleCreateAccount}>Create Account</button>
    </div>
  );
};

export default CreateAccount;