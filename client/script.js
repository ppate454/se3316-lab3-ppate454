function searchName() {
    const input = document.getElementById('search-name')
    const term = input.value;
    fetch("/api/superInfo") 
    .then(res => res.json()
    .then(data => {
        const result = data.filter(item => item.name.toLowerCase().includes(term.toLowerCase()));

        const resultDisplay = document.getElementById("search-result");
        resultDisplay.textContent = JSON.stringify(result, null, 2);
    }))
}

/*function searchPower() {
    const input = document.getElementById('search-power')
    const term = input.value;
    fetch("/api/superInfo") 
    .then(res => res.json()
    .then(data => {
       
    }));
}*/

function searchRace() {
    const input = document.getElementById('search-race')
    const term = input.value;
    fetch("/api/superInfo") 
    .then(res => res.json()
    .then(data => {
        const result = data.filter(item => item.Race.toLowerCase().includes(term.toLowerCase()));

        const resultDisplay = document.getElementById("search-result");
        resultDisplay.textContent = JSON.stringify(result, null, 2);
    }))
}

function searchPublisher() {
    const input = document.getElementById('search-publisher')
    const term = input.value;
    fetch("/api/superInfo") 
    .then(res => res.json()
    .then(data => { 
        const result = data.filter(p => p.Publisher.toLowerCase().includes(term.toLowerCase()));

        const resultDisplay = document.getElementById("search-result");
        resultDisplay.textContent = JSON.stringify(result, null, 2);
    }))
}

function sortName() {
    fetch("/api/superInfo") 
        .then(res => res.json()
        .then(data => {
            data.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
            
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
            const resultDisplay = document.getElementById("search-result");
            resultDisplay.textContent = JSON.stringify(data, null, 2);
        }))
}

function sortRace() {
    fetch("/api/superInfo") 
        .then(res => res.json()
        .then(data => {
            data.sort((a, b) => {
                const raceA = a.Race.toLowerCase();
                const raceB = b.Race.toLowerCase();

                if (raceA < raceB) {
                    return -1;
                }
                if (raceA > raceB) {
                    return 1;
                }
                return 0;
            });

            const resultDisplay = document.getElementById("search-result");
            resultDisplay.textContent = JSON.stringify(data, null, 2);
        }))
}

function sortPublisher() {
    fetch("/api/superInfo") 
        .then(res => res.json()
        .then(data => {
            data.sort((a, b) => {
                const publisherA = a.Publisher.toLowerCase();
                const publisherB = b.Publisher.toLowerCase();

                if (publisherA < publisherB) {
                    return -1;
                }
                if (publisherA > publisherB) {
                    return 1;
                }
                return 0;
            });

            const resultDisplay = document.getElementById("search-result");
            resultDisplay.textContent = JSON.stringify(data, null, 2);
        }))
}
/*
function sortPower() {

} */