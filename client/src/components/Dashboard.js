import React from 'react';
import { useHistory } from 'react-router-dom';
import { useUser } from '../UserContext';

function Dashboard() {
    const { user, logoutUser } = useUser();
    const history = useHistory();

    const handleLogout = async () => {
        try {
          const response = await fetch('/api/logout', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',  // Include credentials for session tracking
          });
    
          if (response.ok) {
            // Successful logout
            logoutUser(user)
            history.push('/login');  // Redirect to the login page or any other page you desire
          } else {
            // Handle error
            console.error('Logout failed');
          }
        } catch (error) {
          console.error('Logout failed', error);
        }
      };
    return (
        <div>
            <header>
                <h1>Hero List Manager</h1>
                <p>
                    Welcome to Hero List Manager! This platform empowers users to create, customize, and share their hero lists. 
                    Logged-in users can save and edit their lists, make them public for community viewing, and engage in discussions 
                    by adding comments and ratings to individual heroes and lists. Additionally, administrators have access to 
                    manage user accounts and handle copyright-related tasks.
                </p>
                <button onClick={handleLogout}>Logout</button>
                <p>{user}</p>
            </header>
        </div>
    );
}

export default Dashboard;