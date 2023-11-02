const express = require('express');
const app = express();
const port = 3000;
const superInfo = require('./superhero_info.json');
const superPowers = require('./superhero_powers.json');

app.use('/', express.static('client'))

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
            res.json(powers);
        } else {                
            res.status(404).send(`Part ${id} was not found`);
        }
    });

app.get('/api/superPublisher', (req,res) => {
    console.log(`GET request for ${req.url}`);
    const publishers = [...new Set(superInfo.map((p) => p.Publisher))];
    res.json(publishers);
});

app.get('/api/superInfo', (req,res) => {
    console.log(`GET request for ${req.url}`);
    res.send(superInfo);
});

app.get('/api/search', (req, res) => {
    console.log(`GET request for ${req.url}`);
    const {field, pattern, n} = req.query;
    const matchingSuper = [];

    for (const supes of superInfo) {
        if (supes[field] && supes[field].toLowerCase().includes(pattern.toLowerCase())) {
            matchingSuper.push(supes.id);
            if (n && matchingSuper.length >= n) {
                break;
            }
        }
    }
    res.json(matchingSuper)
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});