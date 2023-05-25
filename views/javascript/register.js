const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let password = document.getElementsByClassName("password")[0];
    let confirmPassword = document.getElementsByClassName("password")[1];

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (data.password === data.confirmPassword) {
        let registerButton = document.getElementById('register-button');
        let loader = document.getElementById('register-loader');
        registerButton.classList.add('hidden');
        loader.classList.remove('hidden');
        //make request
        delete data.confirmPassword;

        const requestData = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        let res = await fetch("/registerUser", requestData)
        if(!res.ok){
            const msg = await res.json();
            alert(msg.message)
            registerButton.classList.remove('hidden');
            loader.classList.add('hidden');
        }else{
            window.location = "/"
        }
        return false;
    }
    password.classList.add("error");
    confirmPassword.classList.add("error");
    return false;
});