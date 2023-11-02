document.getElementById('search-name').addEventListener('click', getName);

function searchName() {
    fetch("/api/superInfo")
    .then(res => res.json()
    .then(data => {
        console.log(data)
    }))
}