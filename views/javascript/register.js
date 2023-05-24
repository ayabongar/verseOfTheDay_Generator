const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    const loginButton = document.getElementById('register-button');
    const loader = document.getElementById('register-loader');
    loginButton.classList.add('hidden');
    loader.classList.remove('hidden');
});