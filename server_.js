const express = require('express');
const app = express();
const port = process.env.port || 8080;
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const login_handler = require('./UserLogin');


app.use(session({
    secret: 'secret',
    resave : true,
    saveUninitialized : true
}))
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.static(path.join(__dirname,'/views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname, '/views/login.html'));
})

app.get('/register', (req,res) =>{
    res.sendFile(path.join(__dirname, '/views/register.html'));
})

app.get('/verseoftheday', (req,res) =>{
    if(req.session.loggedin){
        res.sendFile(path.join(__dirname, '/views/verse-of-the-day.html'));
    }else{
        res.redirect('/');
    }
})

app.get('/verseoftheweek', (req,res) =>{
    if(req.session.loggedin){
        res.sendFile(path.join(__dirname, '/views/verse-of-the-week.html'));
    }else{
        res.redirect('/');
    }
})

app.post('/auth', (req,res) =>{
    let username = req.body.username;
    let password = req.body.password;
    console.log(username+" "+password);
    if(username && password){
        login_handler.GetUserByUserName(username)
        .then((result) =>{
            console.log(result);
            if(result[0] !== undefined){
                if(result[0].username == username){
                    req.session.loggedin = true;
                    req.session.username = result.username;
                }
            }else{
                res.send('Incorrect Username or Password');
            }
            })
            .then( ()=>{

                if(req.session.loggedin == true)
                {
                    res.redirect('/verseoftheday')
                }
            }
            ).catch(err => console.log(err));
    }
})

app.listen(port, err =>{
    if(err){
        return console.log(err);
    }
    console.log(`Listening On ${port}`);
    
})