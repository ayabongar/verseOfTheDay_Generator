const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let loginButton = document.getElementById('login-button');
    let loader = document.getElementById('login-loader');
    loginButton.classList.add('hidden');
    loader.classList.remove('hidden');
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const requestData = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }
    let res = await fetch("/auth", requestData)
    if (!res.ok) {
        loginButton.classList.remove('hidden');
        loader.classList.add('hidden');
        let inputs = document.getElementsByTagName("input");
        let inputArr = Array.from(inputs);
        inputArr.pop(); //removing button
        inputArr.forEach(input => {
            input.classList.add("error")
        })
    }else{
        window.location = '/verseoftheday';
    }
    return false;
});