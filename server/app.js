const express = require('express');

const app = express();

const port = process.env.PORT || 3001;
const router = express.Router();

const superInfo = require('./superhero_info.json');
const superPowers = require('./superhero_powers.json');

const Storage = require('node-storage');
const store = new Storage('./server/db.json')

app.use(express.json());

/*app.use('/', express.static('client'))

app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});*/

router.use(express.json())

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

app.get('/api/superPublisher', (req,res) => {
    console.log(`GET request for ${req.url}`);
    const publishers = [...new Set(superInfo.map((p) => p.Publisher))];
    res.send(publishers);
});

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

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});