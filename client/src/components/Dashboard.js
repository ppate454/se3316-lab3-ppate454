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
  const [selectedHero2, setSelectedHero2] = useState(null);

  const [publicHeroLists, setPublicHeroLists] = useState([]);
  const [publicHeroes, setPublicHeroes] = useState([])
  const [selectedList, setSelectedList] = useState(null);


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

  const handleViewDetails2 = async (id) => {
    try {
      const response = await fetch(`/api/searchHero/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedHero2(data);
      } else {
        console.error(`Failed to fetch details for hero with ID ${id}`);
      }
    } catch (error) {
      console.error(`Failed to fetch details for hero with ID ${id}`, error);
    }
  };

  const fetchPublicHeroLists = async () => {
    try {
      const response = await fetch('/api/publicHeroLists');
      if (response.ok) {
        const data = await response.json();
        setPublicHeroLists(data);
      } else {
        console.error('Failed to fetch public hero lists');
      }
    } catch (error) {
      console.error('Failed to fetch public hero lists', error);
    }
  };

  const handleShowHeroes = (heros) => {
    setPublicHeroes(heros)
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
          <ul className="search-results-list">
            {searchResults.map((hero) => (
              <li key={hero.id}>
                <div>
                  <strong>{hero.name}</strong> - {hero.publisher}{' '}
                  <button onClick={() => handleViewDetails(hero.id)}>View Details</button>
                </div>
                {selectedHero && selectedHero.id === hero.id && (
                  <div className="hero-details">
                    <h4>{selectedHero.name} Details:</h4>
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
                    <button onClick={() => window.open(selectedHero.ddgButton, '_blank')}>
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
        <h2>Public Hero Lists</h2>
        <button onClick={fetchPublicHeroLists}>Show</button>
        <ul>
          {publicHeroLists.map((list) => (
            <li key={list.name}>
              <div>
                <h3>{list.name}</h3>
                <p>Creator: {list.creatorName}</p>
                <p>Number of Heroes: {list.numberOfHeroes}</p>

                {selectedList === list.name && publicHeroes.map((heroId) => (                  <div>
                    <h4>ID: {heroId}</h4>
                    <button onClick={() => handleViewDetails2(heroId)}>View Details</button>
                    {selectedHero2 && selectedHero2.id === heroId && (
                      <div className="hero-details">
                        <p>ID: {selectedHero2.id}</p>
                        <p>Name: {selectedHero2.name}</p>
                        <p>Powers: {selectedHero2.powers.join(', ')}</p>
                        <p>Publisher: {selectedHero2.publisher}</p>
                        <p>Gender: {selectedHero2.gender}</p>
                        <p>Eye Color: {selectedHero2.eyeColor}</p>
                        <p>Race: {selectedHero2.race}</p>
                        <p>Hair Color: {selectedHero2.hairColor}</p>
                        <p>Height: {selectedHero2.height}</p>
                        <p>Skin Color: {selectedHero2.skinColor}</p>
                        <p>Alignment: {selectedHero2.alignment}</p>
                        <p>Weight: {selectedHero2.weight}</p>
                        <button onClick={() => window.open(selectedHero2.ddgButton)}>
                          Search on DDG
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <p>Last Edited Time: {list.lastEditedTime}</p>
                <p>Average Rating: {list.averageRating}</p>
                <button onClick={() => {handleShowHeroes(list.heros); setSelectedList(list.name)}}>
                  Show Heroes
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button onClick={handleLogout}>Logout</button>
        <p>{user}</p>
      </div>
    </div >
  );
}

export default Dashboard;