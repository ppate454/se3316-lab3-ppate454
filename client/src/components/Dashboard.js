import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useUser } from '../UserContext';
import "./Dashboard.css"

function Dashboard() {
  const { user, logoutUser } = useUser();
  const history = useHistory();
  const [searchParams, setSearchParams] = useState({
    name: '',
    race: '',
    power: '',
    publisher: '',
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedHero, setSelectedHero] = useState(null);

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async () => {
    try {
      const queryString = Object.entries(searchParams)
        .filter(([key, value]) => value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await fetch(`/api/searchHero?${queryString}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await fetch(`/api/searchHero/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedHero(data);
      } else {
        console.error(`Failed to fetch details for hero with ID ${id}`);
      }
    } catch (error) {
      console.error(`Failed to fetch details for hero with ID ${id}`, error);
    }
  };

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
      </header>
      <div>
        <h2>Hero Search</h2>
        <form>
          <label>
            Name:
            <input type="text" name="name" value={searchParams.name} onChange={handleInputChange} />
          </label>
          <label>
            Race:
            <input type="text" name="race" value={searchParams.race} onChange={handleInputChange} />
          </label>
          <label>
            Power:
            <input type="text" name="power" value={searchParams.power} onChange={handleInputChange} />
          </label>
          <label>
            Publisher:
            <input
              type="text"
              name="publisher"
              value={searchParams.publisher}
              onChange={handleInputChange}
            />
          </label>
          <button type="button" onClick={handleSearch}>
            Search
          </button>
        </form>
        <div>
          <h3>Search Results</h3>
          <ul>
            {searchResults.map((hero) => (
              <li key={hero.id}>
                <div>
                  <strong>{hero.name}</strong> - {hero.publisher}{' '}
                  <button onClick={() => handleViewDetails(hero.id)}>View Details</button>
                </div>
                {selectedHero && selectedHero.id === hero.id && (
                  <div className="hero-details">
                    <p>ID: {selectedHero.id}</p>
                    <p>Name: {selectedHero.name}</p>
                    <p>Powers: {selectedHero.powers.join(', ')}</p>
                    <p>Publisher: {selectedHero.publisher}</p>
                    <p>Gender: {selectedHero.gender}</p>
                    <p>Eye Color: {selectedHero.eyeColor}</p>
                    <p>Race: {selectedHero.race}</p>
                    <p>Hair Color: {selectedHero.hairColor}</p>
                    <p>Height: {selectedHero.height}</p>
                    <p>Skin Color: {selectedHero.skinColor}</p>
                    <p>Alignment: {selectedHero.alignment}</p>
                    <p>Weight: {selectedHero.weight}</p>
                    <button onClick={() => window.open(selectedHero.ddgButton)}>
                      Search on DDG
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <button onClick={handleLogout}>Logout</button>
        <p>{user}</p>
      </div>
    </div>
  );
}

export default Dashboard;