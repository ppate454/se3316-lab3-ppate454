import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Login from './components/Login';
import CreateAccount from './components/Register';
import UpdatePassword from './components/UpdatePassword';

function App() {
  return (
    <Router>
      <div>
        <Route path="/" exact>
          {/* You can place your default component or content here */}
          <h1>Welcome to My App</h1>
          <nav>
          <ul>
            <li><Link to="/login">Start</Link></li>
          </ul>
        </nav>
        </Route>

        {/* Route for Login component */}
        <Route path="/login" component={Login} />

        {/* Route for CreateAccount component */}
        <Route path="/create-account" component={CreateAccount} />

        {/* Default route, you can set it to a component or a 404 page */}
      </div>
    </Router>
  );
};

export default App;
