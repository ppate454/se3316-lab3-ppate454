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
    list: {
        type: [{
            name: { type: String, unique: true },
            description: { type: String },
            heroCollection: { type: [Number], required: true },
            visibility: { type: String, enum: ['public', 'private'], default: 'public' },
            lastEditedTime: { type: Date, default: Date.now },
            reviews: [{
                rating: { type: Number },
                comment: { type: String }
            }]
        }],
        default: []
    }
})

//make passport for authenticate
passport.use(new LocalStrategy({ usernameField: 'email' }, async function verify(email, password, cb) {
    console.log(`${email} and ${password}`);
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
            return cb(null, false, { message: 'Verify your email' });
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
        const verificationLink = `http://localhost:3001/api/verify/${email}/${username}`;

        return res.status(201).json({ message: `User registered successfully. Use ${verificationLink} to verify account` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//login check
app.post('/api/login', async (req, res, next) => {
    try {
        passport.authenticate('local', async (err, user, info) => {
            if (err) {
                console.error('Authentication error:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (!user) {
                // Custom handling of unsuccessful authentication
                return res.status(401).json({ message: info.message || 'Authentication failed' });
            }

            // Manually log in the user
            req.logIn(user, (loginErr) => {
                if (loginErr) {
                    console.error('Login error:', loginErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                // If verification is successful, respond with a success message and user details
                return res.status(200).json({ message: 'Login successful', user });
            });
        })(req, res, next);
    } catch (error) {
        console.error('Error during authentication:', error);

        // Extract the error message from Passport info object
        const errorMessage = error && error.info ? error.info.message : 'Authentication failed';

        return res.status(401).json({ message: errorMessage });
    }
});

//email validator and if works change verified 
app.get('/api/verify/:email/:userId', async (req, res) => {
    const { email, username } = req.params;

    try {
        const user = await User.findOne({ email });

        if (!user) {
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

//api/searchHero?vals&vals
app.get('/api/searchHero', (req, res) => {
    console.log(`GET request for ${req.url}`);
    const { name, race, power, publisher } = req.query;
    const matchingSuper = [];

    for (const supes of superInfo) {
        const isNameMatch = !name || supes.name.toLowerCase().startsWith(name.toLowerCase());
        const isRaceMatch = !race || supes.race.toLowerCase().startsWith(race.toLowerCase());
        const isPowerMatch = !power || hasMatchingPower(supes, power);
        const isPublisherMatch = !publisher || supes.Publisher.toLowerCase().startsWith(publisher.toLowerCase());

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

/*app.use('/', express.static('client'))

app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});*/

/*
app.route('/api/superInfo/:id')
    .get((req, res) => {
        const id = req.params.id;
        console.log(`GET request for ${req.url}`);
        const superhero = superInfo.find(s => s.id === parseInt(id));
        if (superhero) {
            res.send(superhero);
        } else {                
            res.status(404).send(`Part ${id} was not found`);
        }
    });

app.route('/api/superPowers/:id')
    .get((req, res) => {
        const id = req.params.id;
        console.log(`GET request for ${req.url}`);
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
            res.send(powers);
        } else {                
            res.status(404).send(`Part ${id} was not found`);
        }
    });



*/
app.get('/api/superPublisher', (req, res) => {
    console.log(`GET request for ${req.url}`);
    const publishers = [...new Set(superInfo.map((p) => p.Publisher))];
    res.send(publishers);
});
/*

app.get('/api/superInfo', (req,res) => {
    console.log(`GET request for ${req.url}`);
    res.send(superInfo);
});

app.get('/api/superPower', (req,res) => {
    console.log(`GET request for ${req.url}`);
    res.send(superPowers);
});

app.get('/api/search', (req, res) => {
    console.log(`GET request for ${req.url}`);
    const {field, pattern, n} = req.query;
    const matchingSuper = [];

    for (const supes of superInfo) {
        if (supes[field] && supes[field].toLowerCase().includes(pattern.toLowerCase())) {
            matchingSuper.push(supes);
            if (n && matchingSuper.length >= n) {
                break;
            }
        }
    }
    res.send(matchingSuper)
});

app.route('/api/list/:list')
    .post((req, res) => {
        console.log(`POST request for ${req.url}`);
        const list = req.params.list;
        store.put(list, {});
        res.send(req.body);
    })
    .get((req, res) => {
        console.log(`GET request for ${req.url}`);
        const list = req.params.list;
        const heroes = store.get(list);
        if (heroes == null || heroes == undefined) {
            res.status(404).send(`List ${list} was not found`);
        } else {
            res.send(heroes);
        }
    })
    .delete((req, res) => {
        console.log(`DELETE request for ${req.url}`);
        const list = req.params.list;
        if (list == null || list == undefined) {
            res.status(404).send(`List ${list} was not found`);
        } else {
            store.remove(list);
            res.send(`List ${list} was deleted`);
        }
    });

app.post('/api/listID/:list/:id', (req, res) => {
    console.log(`POST request for ${req.url}`);
    const list = req.params.list;
    const ids = req.params.id.split(',');

    if (store.get(list) == null || store.get(list) == undefined) {
        res.status(404).send(`List ${list} was not found`);
    }

    for (id of ids) {
        const heroes = superInfo.find(s => s.id === parseInt(id)); //all json w id info
        if (heroes) {
            const pname = superPowers.find(s => s.hero_names === heroes.name);  // all name of json in name 
            if (pname) {
                //get all powers for specific name
                const name = heroes.name;
                const superObject = superPowers.find(s => s.hero_names === name);
                let powers = [];
                
                for (const check in superObject) {
                    if (superObject[check] === 'True') {
                        powers.push(check);
                    }
                }
                store.put(`${list}.${id}`, heroes);
                store.put(`${list}.${id}.Power`, powers);
            }
        } else {
            res.status(404).send(`Heroes was not found`);
        }
    }
    res.send(req.body)
});

app.get('/api/listID/:list', (req, res) => {
    const list = req.params.list;
    const heroes = store.get(list);
    if (heroes == null || heroes == undefined) {
        res.status(404).send(`List ${list} was not found`);
    } else {
        const heroesID = Object.keys(heroes).map(key => parseInt(key, 10));
        res.send(heroesID)
    }
});
*/
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});