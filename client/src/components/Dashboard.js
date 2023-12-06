import React, { useState, useEffect } from 'react';
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

  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newHeroCollection, setNewHeroCollection] = useState('');
  const [newVisibility, setNewVisibility] = useState('private');
  const [info, setInfo] = useState('')

  const [editListName, setEditListName] = useState('');
  const [editListDescription, setEditListDescription] = useState('');
  const [editHeroCollection, setEditHeroCollection] = useState('');
  const [editVisibility, setEditVisibility] = useState('private');
  const [editInfo, setEditInfo] = useState('');
  const [userLists, setUserLists] = useState([]);

  const [deleteListName, setDeleteListName] = useState('');
  const [deleteInfo, setDeleteInfo] = useState('');
  const [userDeleteLists, setUserDeleteLists] = useState([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingList, setRatingList] = useState("")
  const [listsForReview, setListsForReview] = useState([]);
  const [reviewInfo, setReviewInfo] = useState("")

  const storedValue = localStorage.getItem('key');

  const handleAddReview = async () => {
    try {
      const response = await fetch(`/api/addReview/${ratingList}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': storedValue,
        },
        body: JSON.stringify({
          rating: rating,
          comment: comment,
          email: user,
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setRating(0);
        setComment('')
        setRatingList('')
        fetchPublicHeroLists()
        setReviewInfo(data.message)
        // Optionally, update your state or perform other actions after adding the review
      } else {
        const errorData = await response.json();
        console.error(`Error adding review: ${errorData.message}`);
        // Optionally, update your state or show an error message
      }
    } catch (error) {
      console.error('Failed to add review', error);
      // Optionally, update your state or show an error message
    }
  };

  const handleListSelect = (selectedListName) => {
    const selectedList = userLists.find((list) => list.name === selectedListName);

    setEditListDescription(selectedList.description || '');
    setEditHeroCollection(selectedList.heroCollection.join(', ') || '');
    setEditVisibility(selectedList.visibility || 'private');
  };

  const deleteList = async () => {
    try {
      const response = await fetch(`/api/deleteList/${deleteListName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': storedValue,
        },
      });

      if (response.ok) {
        setDeleteInfo(`List deleted successfully`);
        // Optionally, you can reset the form field or perform other actions
        setDeleteListName('');
        fetchUserLists()
        fetchPublicHeroLists()
      } else {
        const errorData = await response.json();
        setDeleteInfo(`Error deleting list: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to delete list', error);
      setDeleteInfo('Error deleting list');
    }
  };

  const fetchUserLists = async () => {
    try {
      const response = await fetch(`/api/getList`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': storedValue,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserLists(data.lists);
        setUserDeleteLists(data.lists);
      } else {
        console.error('Failed to fetch user lists');
      }
    } catch (error) {
      console.error('Failed to fetch user lists', error);
    }
  };

  useEffect(() => {
    // Fetch the user's lists when the component mounts
    fetchPublicHeroLists();
    fetchUserLists();
    if (priv == 'true') {
      setIfAdminInfo("Admin")
    }
  }, [user]);

  const editList = async () => {
    try {
      const trimmedHeroCollection = editHeroCollection.trim();

      // Check if heroCollection is empty or contains only spaces
      if (trimmedHeroCollection === '') {
        console.error('Hero IDs cannot be empty');
        setEditInfo('Hero IDs cannot be empty');
        return;
      }
      const response = await fetch(`/api/editList/${editListName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': storedValue,
        },
        body: JSON.stringify({
          description: editListDescription,
          heroCollection: editHeroCollection.split(',').map(id => Number(id.trim())),
          visibility: editVisibility,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchPublicHeroLists()
        setEditInfo(data.message);
        setEditListName('');
        setEditListDescription('');
        setEditHeroCollection('');
        setEditVisibility('private');
        fetchUserLists()
      } else {
        const errorData = await response.json();
        setInfo(`Error editing list: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to edit list', error);
      setInfo('Error editing list');
    }
  };

  const createList = async () => {
    try {

      const trimmedHeroCollection = newHeroCollection.trim();

      // Check if heroCollection is empty or contains only spaces
      if (trimmedHeroCollection === '') {
        console.error('Hero IDs cannot be empty');
        setInfo('Hero IDs cannot be empty');
        return;
      }
      const response = await fetch('/api/createList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': storedValue,
        },
        body: JSON.stringify({

          name: newListName,
          description: newListDescription,
          heroCollection: newHeroCollection.split(',').map(id => Number(id.trim())),
          visibility: newVisibility,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        fetchPublicHeroLists()
        setInfo(data.message)
        setNewListName('');
        setNewListDescription('');
        setNewHeroCollection('');
        setNewVisibility('private');
        fetchUserLists();
      } else {
        console.error('Failed to create list');
      }
    } catch (error) {
      console.error('Failed to create list', error);
    }
  };

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
        setListsForReview(data)
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

  const handleAdminClick = () => {
    if (priv == 'true') {
      history.push('/admin');
    } else {
      setAdminInfo("User is not an admin")
    }
  };

  const priv = localStorage.getItem('priv');
  const [adminInfo, setAdminInfo] = useState('')
  const [ifadminInfo, setIfAdminInfo] = useState('')

  return (
    <div>
      <p>{ifadminInfo}</p>
      <header>
        <h1>Hero List Manager</h1>
        <p>
          Welcome to Hero List Manager! This platform empowers users to create, customize, and share their hero lists.
          Logged-in users can save and edit their lists, make them public for community viewing, and engage in discussions
          by adding comments and ratings to individual heroes and lists. Additionally, administrators have access to
          manage user accounts and handle copyright-related tasks.
        </p>
        <button onClick={handleAdminClick}>
          Go to Admin
        </button>
        <p>{adminInfo}</p>
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
                  <button className='h' onClick={() => handleViewDetails(hero.id)}>View Details</button>
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
        <ul>
          {publicHeroLists.map((list) => (
            <li key={list.name}>
              <div>
                <h3>{list.name}</h3>
                <p>Creator: {list.creatorName}</p>
                <p>Number of Heroes: {list.numberOfHeroes}</p>

                {selectedList === list.name && publicHeroes.map((heroId) => (<div>
                  <div>
                    <strong>ID: {heroId}</strong>
                    <button onClick={() => handleViewDetails2(heroId)}>View Details</button>
                  </div>
                  {selectedHero2 && selectedHero2.id === heroId && (
                    <div className="hero-details">
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
                <p>Average Rating: {list.averageRating}/5</p>
                <button onClick={() => { handleShowHeroes(list.heros); setSelectedList(list.name) }}>
                  Show Heroes
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Add Review</h2>
        <label htmlFor="selectListForReview">Select List for Review:</label>
        <select
          id="selectListForReview"
          name="selectListForReview"
          value={ratingList}
          onChange={(e) => {
            setRatingList(e.target.value);
          }}
          required
        >
          <option value="" disabled>Select a List</option>
          {listsForReview.map((list) => (
            <option key={list.name} value={list.name}>{list.name}</option>
          ))}
        </select>
        <label>
          Rating:
          <input
            type="number"
            name="rating"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value, 10))}
            min="0"
            max="5"
          />
        </label>
        <label>
          Comment:
          <textarea
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleAddReview}>
          Add Review
        </button>
        <p>{reviewInfo}</p>
      </div>
      <div>
        <h2>Personal Hero Lists</h2>

        <div>
          <h4>Create a List:</h4>
          <form id="createListForm">
            <label htmlFor="listName">List Name:</label>
            <input
              type="text"
              id="listName"
              name="listName"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              required
            />

            <label htmlFor="listDescription">Description:</label>
            <input
              type="text"
              id="listDescription"
              name="listDescription"
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
            />

            <label htmlFor="heroCollection">Hero Collection:</label>
            <input
              type="text"
              id="heroCollection"
              name="heroCollection"
              placeholder="Comma-separated hero IDs"
              value={newHeroCollection}
              onChange={(e) => setNewHeroCollection(e.target.value)}
            />

            <label htmlFor="visibility">Visibility:</label>
            <select
              id="visibility"
              name="visibility"
              value={newVisibility}
              onChange={(e) => setNewVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <button type="button" onClick={createList}>
              Create List
            </button>
          </form>
          <p>{info}</p>
        </div>

        <div>
          <h4>Edit a List:</h4>
          <form id="editListForm">
            <label htmlFor="editListName">Select List to Edit:</label>
            <select
              id="editListName"
              name="editListName"
              value={editListName}
              onChange={(e) => {
                setEditListName(e.target.value);
                handleListSelect(e.target.value);
              }}
              required
            >
              <option value="" disabled>Select a List</option>
              {userLists.map((list) => (
                <option key={list.name} value={list.name}>{list.name}</option>
              ))}
            </select>

            <label htmlFor="editListDescription">Description:</label>
            <input
              type="text"
              id="editListDescription"
              name="editListDescription"
              value={editListDescription}
              onChange={(e) => setEditListDescription(e.target.value)}
            />

            <label htmlFor="editHeroCollection">Hero Collection:</label>
            <input
              type="text"
              id="editHeroCollection"
              name="editHeroCollection"
              placeholder="Comma-separated hero IDs"
              value={editHeroCollection}
              onChange={(e) => setEditHeroCollection(e.target.value)}
              required
            />

            <label htmlFor="editVisibility">Visibility:</label>
            <select
              id="editVisibility"
              name="editVisibility"
              value={editVisibility}
              onChange={(e) => setEditVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <button type="button" onClick={editList}>
              Edit List
            </button>
          </form>
          <p>{editInfo}</p>
        </div>

        <div>
          <h4>Delete a List:</h4>
          <form id="deleteListForm">
            <label htmlFor="deleteListName">Select List to Delete:</label>
            <select
              id="deleteListName"
              name="deleteListName"
              value={deleteListName}
              onChange={(e) => setDeleteListName(e.target.value)}
              required
            >
              <option value="" disabled>Select a List</option>
              {userLists.map((list) => (
                <option key={list.name} value={list.name}>{list.name}</option>
              ))}
            </select>

            <button type="button" onClick={deleteList}>
              Delete List
            </button>
          </form>
          <p>{deleteInfo}</p>
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