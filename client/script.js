function searchName() {
    const input = document.getElementById('search-name')
    const term = input.value;
    const vals = document.getElementById('number')
    const amount = vals.value
    fetch(`/api/search?field=name&pattern=${term}&n=${amount}`) 
    .then(res => res.json()
    .then(data => {
        const resultDisplay = document.getElementById("search-result");
        resultDisplay.textContent = JSON.stringify(data, null, 2);
    }))
}

function searchPower() {
    const input = document.getElementById('search-power')
    const term = input.value
    fetch("/api/superPower")
        .then(res => res.json())
        .then(data => {
            // Filter superheroes with the specified superpower
            const filteredSuperheroes = data.filter(superhero => {
                // Check if the searchTerm is a key in the superhero object and it's "True"
                return term in superhero && superhero[term] === "True";
            });

            // Display the filtered superheroes and their powers
            const resultDisplay = document.getElementById("search-result");
            if (filteredSuperheroes.length > 0) {
                const resultText = filteredSuperheroes.map(superhero => {
                    return `${superhero.hero_names}: ${term}`;
                }).join('\n');
                resultDisplay.textContent = resultText;
            } else {
                resultDisplay.textContent = "No superheroes found with this superpower.";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function searchRace() {
    const input = document.getElementById('search-race')
    const term = input.value;
    const vals = document.getElementById('number')
    const amount = vals.value
    fetch(`/api/search?field=Race&pattern=${term}&n=${amount}`) 
    .then(res => res.json()
    .then(data => {
        const resultDisplay = document.getElementById("search-result");
        resultDisplay.textContent = JSON.stringify(data, null, 2);
    }))
}

function searchPublisher() {
    const input = document.getElementById('search-publisher')
    const term = input.value;
    const vals = document.getElementById('number')
    const amount = vals.value
    fetch(`/api/search?field=Publisher&pattern=${term}&n=${amount}`) 
    .then(res => res.json()
    .then(data => {
        const resultDisplay = document.getElementById("search-result");
        resultDisplay.textContent = JSON.stringify(data, null, 2);
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

function sortPower() {
    fetch("/api/superPower") 
    .then(res => res.json())
    .then(filteredHeroes => {

        // Sort the filtered heroes by hero_name
        filteredHeroes.sort((a, b) => {
            if (a.hero_names < b.hero_names) return -1;
            if (a.hero_names > b.hero_names) return 1;
            return 0;
        });

        // Extract true superpowers from the filtered heroes
        const trueSuperpowers = filteredHeroes.map(hero => {
            const superpowers = {};
            for (const [key, value] of Object.entries(hero)) {
                if (value === "True" && key !== "hero_names") {
                    superpowers[key] = value;
                }
            }
            return {
                hero_names: hero.hero_names,
                superpowers: superpowers
            };
        });

        const resultDisplay = document.getElementById("search-result");
        resultDisplay.textContent = JSON.stringify(trueSuperpowers, null, 2);
    })
} 

function createList() {
    const input = document.getElementById('create-list')
    const term = input.value;
    const dropdown = document.getElementById('list-drop')
    const resultDisplay = document.getElementById('search-result');

    
    if (term && term.trim() !== '') {
        // Check if the term already exists in the dropdown
        if ([...dropdown.options].some(option => option.value === term)) {
            resultDisplay.textContent = ('List with the same name already exists in the dropdown.');
        } else {
            fetch(`/api/list/${term}`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
            })
                .then(res => {
                    const option = document.createElement('option');
                    option.value = term;
                    option.textContent = term;
                    dropdown.append(option);

                    resultDisplay.textContent = `List ${term} created!`;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    } else {
        resultDisplay.textContent = ('Please enter a valid list name.');
    }
}

function displayList() {
    const dropdown = document.getElementById('list-drop')
    const term = dropdown.value
    const resultDisplay = document.getElementById("search-result");
    if (term) {
        fetch(`/api/list/${term}`)
            .then(res => res.json())
            .then(data => {
                resultDisplay.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        resultDisplay.textContent = ('Please select a value from the dropdown.');
    }
}

function displayListID() {
    const dropdown = document.getElementById('list-drop')
    const term = dropdown.value
    const resultDisplay = document.getElementById("search-result");
    if (term) {
        fetch(`/api/listID/${term}`)
            .then(res => res.json())
            .then(data => {
                resultDisplay.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        resultDisplay.textContent = ('Please select a value from the dropdown.');
    }
}

function updateList() {
    const input = document.getElementById('update-list')
    const term = input.value
    const dropdown = document.getElementById('list-drop')
    const drop = dropdown.value
    const resultDisplay = document.getElementById('search-result');
    if (term && drop) {
        // Check if term is a comma-separated list of numbers
        const idArray = term.split(',').map(id => parseInt(id));
        const isValid = idArray.every(id => !isNaN(id) && id >= 0);

        if (isValid) {
            fetch(`/api/listID/${drop}/${term}`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
            })
                .then(res => {
                    resultDisplay.textContent = `List ${drop} updated!`;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            resultDisplay.textContent = ('Invalid term. Please enter a comma-separated list of valid numbers.');
        }
    } else {
        resultDisplay.textContent = ('Please select a value from the dropdown and enter a valid term.');
    }
}

function deleteList() {
    const dropdown = document.getElementById('list-drop')
    const term = dropdown.value
    const resultDisplay = document.getElementById("search-result");
    if (term) {
        fetch(`/api/list/${term}`, {
            method: 'DELETE',
        })
            .then(res => {
                if (res.status === 200) {
                    resultDisplay.textContent = `List ${term} deleted!`;

                    const selectedOption = dropdown.querySelector(`option[value="${term}"]`);
                    if (selectedOption) {
                        dropdown.removeChild(selectedOption);
                    }
                } else if (res.status === 404) {
                    resultDisplay.textContent = `List ${term} not found.`;
                } else {
                    // Handle other response statuses as needed
                    console.log('Error deleting list');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        resultDisplay.textContent = ('Please select a value from the dropdown to delete.');
    }
}
