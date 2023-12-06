import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import { UserProvider } from './UserContext';
import Login from './components/Login';
import CreateAccount from './components/Register';
import Dashboard from './components/Dashboard';
import UpdatePassword from './components/UpdatePassword';
import Admin from './components/Admin';

function App() {
  return (
    <Router>
      <UserProvider>
        <div>
          <Route path="/" exact>
            {/* You can place your default component or content here */}
            <h1>Welcome to My App</h1>
            <nav>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/create-account">Create Account</Link></li>
                <li><Link to="/update-password">Update Password</Link></li>
              </ul>
            </nav>
          </Route>

          <Route path="/update-password" component={UpdatePassword} />

          <Route path="/admin" component={Admin} />

          {/* Route for Login component */}
          <Route path="/login" component={Login} />

          {/* Route for CreateAccount component */}
          <Route path="/create-account" component={CreateAccount} />

          {/* Route for Dashboard component */}
          <Route path="/dashboard" component={Dashboard} />
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;
