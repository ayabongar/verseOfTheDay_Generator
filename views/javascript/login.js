const form = document.querySelector('form');
// const username = document.getElementById('username');
// const password = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const loader = document.getElementById('login-loader');

form.addEventListener('submit', (e) => {
    loginButton.classList.add('hidden');
    loader.classList.remove('hidden');


    fetch('/auth')
    .then( function(response){
        console.log(response.json());
    }).then( function(text){
        alert(text);
    }).catch( (err)=>{alert(err)});
    
});