const express = require('express');

const app = express();

const port = process.env.PORT || 3001;
const router = express.Router();

const superInfo = require('./superhero_info.json');
const superPowers = require('./superhero_powers.json');

const Storage = require('node-storage');
const store = new Storage('./server/db.json')
const mongoose = require('mongoose')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt');
const validator = require('validator')
const session = require('express-session');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb+srv://ppate454:prey@cluster0.c8hmqab.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('DB Connected');
    })
    .catch((e) => {
        console.log('DB not Connected', e);
    })

app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

const User = mongoose.model('User', {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    list: {
        type: [{
            name: { type: String, unique: true, required: true },
            description: { type: String },
            heroCollection: { type: [Number], required: true },
            visibility: { type: String, enum: ['public', 'private'], default: 'public' },
            lastEditedTime: { type: Date, default: Date.now },
            reviews: [{
                rating: { type: Number, required: true },
                reviewUser: { type: String, required: true },
                comment: { type: String },
                creationDate: { type: Date, default: Date.now },
                hidden: { type: Boolean, default: false }
            },]
        }],
        default: []
    }
})


// make passport for authenticate
passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, async function verify(req, email, password, cb) {
    console.log(`${email} and ${password}`);
    host = req.host
    console.log(host)

    try {
        // Find user by email in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
            return cb(null, false, { message: 'Incorrect email or password.' });
        }
        if (user.disabled === true) {
            return cb(null, false, { message: 'Contact the site administrator' });
        }
        if (!user.verified) {
            console.log("unverified")
            const verificationLink = `http://${host}:3001/api/verify/${email}/${user._id}`;
            // Use req.headers.host to dynamically get the host from the request
            return cb(null, false, { message: `Verify your email ${verificationLink}` });
        }

        // Compare hashed password using bcrypt.compare
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log('Passwords do not match:');
            return cb(null, false, { message: 'Incorrect email or password.' });
        }

        console.log("Authenticated")
        return cb(null, user, { message: 'Valid User' });
    } catch (error) {
        console.error(error);
        return cb(error);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);

        if (!user) {
            return done(null, false, { message: 'User not found.' });
        }

        return done(null, user);
    } catch (error) {
        console.error('Error finding user by ID:', error);
        return done(error);
    }
});

app.get('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ success: false, message: 'Error during logout.' });
        }
        res.json({ success: true, message: 'Logged out successfully.' });
    });
})

app.put('/api/update-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        // Implement your password update logic here
        // Verify the user's current password, and update it with the new one

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify the current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password in the database
        user.password = hashedPassword;
        console.log("updated password")
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//email validator and if works change verified 
app.get('/api/verify/:email/:userId', async (req, res) => {
    const { email, userId } = req.params;

    try {
        const user = await User.findOne({ email });

        if (!user || user._id != userId) {
            return res.status(400).json({ message: 'Invalid verification link.' });
        }
        user.verified = true;
        await user.save();

        res.json({ message: 'Email address verified successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const stringSimilarity = require('string-similarity');

//api/searchHero?vals&vals
app.get('/api/searchHero', (req, res) => {
    console.log(`GET request for ${req.url}`);
    const { name, race, power, publisher } = req.query;
    const matchingSuper = [];

    // Function to remove white spaces from a string
    const removeWhiteSpace = str => str.replace(/\s/g, '');

    // Function to compare two strings with a tolerance of up to two characters difference
    const softMatch = (str1, str2) => {
        if (str1 === str2 || str1.startsWith(str2)) {
            return true;
        }

        if (str2.length > 3) {
            const minLength = str2.length;
            let diffCount = 0;

            for (let i = 0; i < minLength; i++) {
                if (str1[i] !== str2[i]) {
                    diffCount++;
                    if (diffCount > 2 || str1.length < 2) {
                        return false;
                    }
                }
            }

            return true;
        }

        return false;
    };

    for (const supes of superInfo) {
        const isNameMatch = !name || softMatch(removeWhiteSpace(supes.name.toLowerCase()), removeWhiteSpace(name.toLowerCase()));
        const isRaceMatch = !race || (supes.Race && softMatch(removeWhiteSpace(supes.Race.toLowerCase()), removeWhiteSpace(race.toLowerCase())));
        const isPowerMatch = !power || hasMatchingPower(supes, power);
        const isPublisherMatch = !publisher || (supes.Publisher && softMatch(removeWhiteSpace(supes.Publisher.toLowerCase()), removeWhiteSpace(publisher.toLowerCase())));

        if (isNameMatch && isRaceMatch && isPowerMatch && isPublisherMatch) {
            matchingSuper.push({
                id: supes.id,
                name: supes.name,
                publisher: supes.Publisher,
            });
        }
    }

    res.send(matchingSuper);
});

function hasMatchingPower(hero, power) {
    const superObject = superPowers.find(s => s.hero_names === hero.name);
    if (superObject) {
        for (const check in superObject) {
            if (check !== 'hero_names' && superObject[check] === 'True' && check.toLowerCase().startsWith(power.toLowerCase())) {
                return true;
            }
        }
    }
    return false;
}

//additional info on each hero by id
app.get('/api/searchHero/:id', (req, res) => {
    console.log(`GET request for ${req.url}`);
    const id = req.params.id;
    const superhero = superInfo.find(s => s.id === parseInt(id));

    if (superhero) {
        const name = superhero.name;
        const superObject = superPowers.find(s => s.hero_names === name);
        let powers = [];

        for (const check in superObject) {
            if (superObject[check] === 'True') {
                powers.push(check);
            }
        }

        const heroDetails = {
            id: superhero.id,
            name: superhero.name,
            powers: powers,
            publisher: superhero.Publisher,
            gender: superhero.Gender,
            eyeColor: superhero["Eye color"],
            race: superhero.Race,
            hairColor: superhero["Hair color"],
            height: superhero.Height,
            skinColor: superhero["Skin color"],
            alignment: superhero.Alignment,
            weight: superhero.Weight,
        };

        const ddgSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(superhero.name)}`;
        heroDetails.ddgButton = ddgSearchUrl;

        res.send(heroDetails);
    } else {
        res.status(404).send(`Hero with ID ${id} was not found`);
    }
});

//make item for registering
app.post('/api/register', async (req, res) => {
    try {
        // Extract user information from the request body
        const { email, username, password } = req.body;

        // Validate email and password
        if (!validator.isEmail(email) || password.length < 6) {
            return res.status(400).json({ message: 'Invalid email or password format' });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user object
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            salt,
        });

        // Save the user to the database
        await newUser.save();

        //make unique verification link
        const verificationLink = `http://${req.headers.host}/api/verify/${email}/${newUser._id}`;

        return res.status(201).json({ message: `User registered successfully. Use ${verificationLink} to verify account` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Example usage of passport.authenticate in a route
app.post('/api/login', async (req, res, next) => {
    try {
        const host = req.headers.host; // Define host here
        req.host = host

        passport.authenticate('local', { host }, async (err, user, info) => {
            if (err) {
                console.error('Authentication error:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (!user) {
                return res.status(401).json({ message: info.message || 'Authentication failed' });
            }

            // Manually log in the user
            req.logIn(user, (loginErr) => {
                if (loginErr) {
                    console.error('Login error:', loginErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                const priv = user.isAdmin;
                console.log(priv)
                // Generate a JWT token
                const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '24h' });
                console.log(token)
                // Include the token in the response
                return res.status(200).json({ message: 'Login successful', user, token, priv });
            });
        })(req, res, next);
    } catch (error) {
        console.error('Error during authentication:', error);
        const errorMessage = error && error.info ? error.info.message : 'Authentication failed';
        return res.status(401).json({ message: errorMessage });
    }
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }

        // Attach the decoded user ID to the request object
        req.userId = decoded.userId;
        next();
    });
};

app.post('/api/createList', verifyToken, async (req, res) => {
    try {
        const { name, description, heroCollection, visibility } = req.body;

        // Check if heroCollection has values and name length is > 0
        if (!heroCollection || heroCollection.length === 0) {
            return res.status(400).json({ message: 'heroCollection cannot be empty' });
        }

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'List name cannot be empty' });
        }

        // Check if the list name already exists for the user
        const listExists = await User.exists({ _id: req.userId, 'list.name': name });
        if (listExists) {
            return res.status(409).json({ message: 'List name already exists' });
        }

        // Find the user by ID
        let user = await User.findById(req.userId);

        // If the user does not exist, handle accordingly
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newList = {
            name: name.trim(),
            description: description || '',
            heroCollection: heroCollection.map(Number),
            visibility: visibility || 'private',
            lastEditedTime: new Date(),
        };

        user.list.push(newList);
        await user.save();

        res.status(201).json({ message: 'List created successfully', list: newList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/editList/:listName', verifyToken, async (req, res) => {
    try {
        const { listName } = req.params;
        const { description, heroCollection, visibility } = req.body;
        const userId = req.userId; // Use userId from JWT token

        if (!heroCollection || heroCollection.length === 0) {
            return res.status(400).json({ message: 'heroCollection cannot be empty' });
        }

        // Find the user by userId
        let user = await User.findById(userId);

        // If the user does not exist, return a 404 error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the list within the user's lists
        const listIndex = user.list.findIndex((list) => list.name === listName);

        // If the list does not exist, return a 404 error
        if (listIndex === -1) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Update the list details
        user.list[listIndex].description = description || '';
        user.list[listIndex].heroCollection = heroCollection ? heroCollection.map(Number) : [];
        user.list[listIndex].visibility = visibility || 'private';
        user.list[listIndex].lastEditedTime = new Date();

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'List edited successfully', list: user.list[listIndex] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.delete('/api/deleteList/:listName', verifyToken, async (req, res) => {
    try {
        const { listName } = req.params;
        const userId = req.userId; // Use userId from JWT token

        // Find the user by userId
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the index of the list with the specified listName
        const listIndex = user.list.findIndex(list => list.name === listName);

        // Check if the list exists
        if (listIndex === -1) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Remove the list at the specified index
        user.list.splice(listIndex, 1);

        // Save the updated user object
        await user.save();

        res.status(200).json({ message: 'List deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//get 10 most recent lists to display
app.get('/api/publicHeroLists', async (req, res) => {
    try {
        const publicUsers = await User.find(
            { 'list.visibility': 'public' },
            { username: 1, list: 1 }
        );

        // Format the response as needed
        const formattedLists = publicUsers
            .map(user => {
                const userLists = user.list.filter(list => list.visibility === 'public');
                return userLists.map(listDetails => ({
                    name: listDetails.name,
                    creatorName: user.username,
                    lastEditedTime: listDetails.lastEditedTime, // Make sure lastEditedTime is a Date object
                    heros: listDetails.heroCollection,
                    numberOfHeroes: listDetails.heroCollection.length,
                    averageRating: listDetails.reviews.length > 0 ? calculateAverageRating(listDetails.reviews) : 'No reviews',

                }));
            })
            .flat();

        // Sort the lists by lastEditedTime in descending order
        formattedLists.sort((a, b) => b.lastEditedTime - a.lastEditedTime);

        // Take the top 10 lists
        const recentLists = formattedLists.slice(0, 10);

        res.status(200).json(recentLists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
        return 0; // Default to 0 if there are no reviews
    }

    let sumOfRatings = 0;

    // Use a for loop to calculate the sum of ratings
    for (let i = 0; i < reviews.length; i++) {
        sumOfRatings += reviews[i].rating; // Rating is a single value, not an array
    }

    // Calculate the average rating
    const averageRating = sumOfRatings / reviews.length;

    // Round to 2 decimal places
    return Math.round(averageRating * 100) / 100;
};

app.get('/api/getList', verifyToken, async (req, res) => {
    try {
        const userId = req.userId; // Use userId from JWT token

        // Find the user by userId
        const user = await User.findById(userId);

        // If the user does not exist, return a 404 error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user's lists
        res.status(200).json({ lists: user.list });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/addReview/:listName', verifyToken, async (req, res) => {
    try {
        const { listName } = req.params;
        const { rating, comment } = req.body;
        const userId = req.userId; // Use userId from JWT token

        // Check if rating is within the valid range (0-5)
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating. Rating must be between 0 and 5.' });
        }

        // Find the user by userId
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the index of the list in the user's array
        const listIndex = user.list.findIndex((list) => list.name === listName);

        // Check if the list exists
        if (listIndex === -1) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Find the user by userId
        const name = await User.findById(userId);

        if (!name) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new review
        const newReview = {
            rating: rating,
            reviewUser: name.username,
            comment: comment || '', // Set default value or leave it empty
            creationDate: Date.now(),
        };

        // Add the review to the list
        user.list[listIndex].reviews.push(newReview);

        // Save the updated user object
        await user.save();

        res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add this route to get all users (requires admin privilege)
app.get('/api/getAllNonAdminEmails', async (req, res) => {
    try {
        // Find all non-admin users and select only email addresses
        const nonAdminUsers = await User.find({ isAdmin: false }, { _id: 0, email: 1 });

        // Extract emails from non-admin users
        const nonAdminEmails = nonAdminUsers.map(user => user.email);
        console.log(nonAdminEmails)
        res.status(200).json({ emails: nonAdminEmails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/makeAdmin/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find the user by userId
        const user = await User.findOne({ email: email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's isAdmin field to true
        user.isAdmin = true;

        // Save the updated user object
        await user.save();

        res.status(200).json({ message: 'User is now an admin', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/disableUser/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find the user by email
        const user = await User.findOne({ email: email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's disabled field to true
        user.disabled = true;

        // Save the updated user object
        await user.save();

        res.status(200).json({ message: 'User account disabled', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add this route to undisable a user account (requires admin privilege)
app.put('/api/undisableUser/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find the user by email
        const user = await User.findOne({ email: email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's disabled field to false
        user.disabled = false;

        // Save the updated user object
        await user.save();

        res.status(200).json({ message: 'User account undisabled', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/reviews/:listName', async (req, res) => {
    const { listName } = req.params;

    try {
        const user = await User.findOne({ 'list.name': listName });

        if (!user) {
            return res.status(404).json({ message: 'List not found' });
        }

        const list = user.list.find((listItem) => listItem.name === listName);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        const reviews = list.reviews;
        console.log(reviews)

        res.json({ reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/reviews/:listName/:reviewId', async (req, res) => {
    const { listName, reviewId } = req.params;
    const { hidden } = req.body;

    try {
        const user = await User.findOne({ 'list.name': listName });

        if (!user) {
            return res.status(404).json({ message: 'List not found' });
        }

        const list = user.list.find((listItem) => listItem.name === listName);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        const review = list.reviews.id(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.hidden = hidden;

        await user.save();

        res.json({ message: 'Review hidden status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
