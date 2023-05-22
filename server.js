const express = require('express');
const app = express();
const port = process.env.port || 8080;
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const login_handler = require('./UserLogin');
const reg_handler = require('./UserRegistration');



app.use(session({
    secret: 'secret',
    resave : true,
    saveUninitialized : true
}))
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.static(path.join(__dirname,'/views')));
app.use(express.static(path.join(__dirname,'/views/javascript')));
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

app.post('/registerUser', (req,res) =>{
    let username = req.body.username;
    let password = req.body.password;
    if(username && password){
        //TODO - SANITIZE TEXT
        try{
            reg_handler.RegisterUser(username,password)
            .then(result =>{
                console.log('user registered successfully');
                res.redirect('/');
            })
        }catch(error){
            res.status(500).send();
        }
    }

})

app.post('/auth', (req,res) =>{
    let username = req.body.username;
    let password = req.body.password;
    if(username && password){
        login_handler.VerifyLogin(username,password)
        .then(result => {
            if(result){
                console.log('user login succcess');
                req.session.loggedin = true;
                req.session.username = result.username;
                res.redirect('/verseoftheday')
            }else{
                res.json({success: 'fail'});
            }
        });
    }
})

app.get("/api/verse-day",(req, res)=>{
    //used to see if the user has already liked it
    let username = req.session.username;

    let date = new Date();
    //+1 to account for indexing
    let day = date.getDay() + 1;
    let month = date.getMonth() + 1;
    let id = day.toString() + month.toString();
    //make db call

    //make api call
    //verse is populated by the api request and db call to see if the verse is liked
    //dummy data
    let verse = {
        title:"John 3:16",
        body:"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not " +
        "perish but have eternal life.",
        liked:true,
    };
    // res.status(200).json(verse);
    res.send(verse)
})

app.patch("/api/liked/:isLiked", (req, res)=>{
    let isLiked = req.params.isLiked; //boolean
    let username = req.session.username;
    //apply update to db with username and isLiked status
    
    res.send("Successfull")
})

app.listen(port, err =>{
    if(err){
        return console.log(err);
    }
    console.log(`Listening On ${port}`);
    
})