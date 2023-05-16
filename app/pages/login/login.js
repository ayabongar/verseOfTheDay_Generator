const form = document.querySelector('form');
const username = document.getElementById('username');
const password = document.getElementById('password');


form.addEventListener('submit', (e) => {
    e.preventDefault();
    //Creates Key-Value
    
    let payload = new FormData(form);
    let value = Object.fromEntries(payload);
    let jsonData = JSON.stringify(value);
    console.log({jsonData});

    fetch('http://localhost:8080/auth/', {
        method:'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body: jsonData
    }).then(res => res.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
});