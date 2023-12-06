import React, { useState, useEffect } from 'react';

const Admin = () => {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [action, setAction] = useState('');
    const [nonAdminEmails, setNonAdminEmails] = useState([]);
    const [info, setInfo] = useState([]);
    const [publicHeroLists, setPublicHeroLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [reviews, setReviews] = useState([]);


    const fetchNonAdminEmails = () => {
        fetch('/api/getAllNonAdminEmails')
            .then(response => response.json())
            .then(data => setNonAdminEmails(data.emails))
            .catch(error => console.error('Error fetching non-admin user emails:', error));
    };

    const fetchReviews = async (listName) => {
        try {
            const response = await fetch(`/api/reviews/${listName}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews);
            } else {
                console.error(`Failed to fetch reviews for ${listName}`);
            }
        } catch (error) {
            console.error(`Failed to fetch reviews for ${listName}`, error);
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

    // Call the function inside useEffect
    useEffect(() => {
        fetchNonAdminEmails();
        fetchPublicHeroLists();
    }, []);

    const handleListChange = async (event) => {
        const selectedList = event.target.value;
        setSelectedList(selectedList);

        // Call fetchReviews and update the reviews state
        await fetchReviews(selectedList);
    };

    const handleUserChange = (event) => {
        setSelectedUserId(event.target.value);
    };

    const handleActionChange = (event) => {
        setAction(event.target.value);
    };

    const handlePerformAction = () => {
        // Perform the selected action (disable, make admin, or undisable) for the selected user
        if (selectedUserId && action) {
            let endpoint;
            switch (action) {
                case 'makeAdmin':
                    endpoint = '/api/makeAdmin/';
                    break;
                case 'disable':
                    endpoint = '/api/disableUser/';
                    break;
                case 'undisable':
                    endpoint = '/api/undisableUser/';
                    break;
                default:
                    return;
            }

            fetch(`${endpoint}${selectedUserId}`, {
                method: 'PUT',
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    setInfo(data.message)
                })
                .catch(error => console.error('Error performing action:', error));
        }
    };

    return (
        <div>
            <h2>Admin Page</h2>
            <p>Welcome to the admin dashboard</p>

            <div>
                <label>Select User:</label>
                <select onChange={handleUserChange} value={selectedUserId}>
                    <option value="">Select User</option>
                    {nonAdminEmails.map(email => (
                        <option key={email} value={email}>
                            {email}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Action:</label>
                <div>
                    <input
                        type="radio"
                        id="disable"
                        name="action"
                        value="disable"
                        onChange={handleActionChange}
                    />
                    <label htmlFor="disable">Disable Account</label>
                </div>
                <div>
                    <input
                        type="radio"
                        id="makeAdmin"
                        name="action"
                        value="makeAdmin"
                        onChange={handleActionChange}
                    />
                    <label htmlFor="makeAdmin">Make Admin</label>
                </div>
                <div>
                    <input
                        type="radio"
                        id="undisable"
                        name="action"
                        value="undisable"
                        onChange={handleActionChange}
                    />
                    <label htmlFor="undisable">Undisable Account</label>
                </div>
            </div>

            <button onClick={handlePerformAction}>Perform Action</button>
            <p>{info}</p>

            <div>
                <label>Select Hero List:</label>
                <select onChange={handleListChange}>
                    <option value="">Select List</option>
                    {publicHeroLists.map(list => (
                        <option key={list.name} value={list.name}>
                            {list.name} by {list.creatorName}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <h3>Reviews for {selectedList}:</h3>
                {reviews.length > 0 ? (
                    <ul>
                        {reviews.map((review, index) => (
                            <li key={index}>
                                {review.rating} {review.comment} by {review.reviewUser}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No reviews available for {selectedList}.</p>
                )}
            </div>
        </div>
    );
};

export default Admin;