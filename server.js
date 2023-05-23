const express = require('express');
const app = express();
const port = process.env.port || 8080;
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const login_handler = require('./UserLogin');
const reg_handler = require('./UserRegistration');
const verse_handler = require('./VerseHandler');
const sql = require('msnodesqlv8');
require('dotenv').config()

const BIBLE_API_KEY = process.env.BIBLE_API_KEY;

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/views')));
app.use(express.static(path.join(__dirname, '/views/javascript')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/login.html'));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/register.html'));
})

app.get('/verseoftheday', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, '/views/verse-of-the-day.html'));
    } else {
        res.redirect('/');
    }
})

app.get('/verseoftheweek', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, '/views/verse-of-the-week.html'));
    } else {
        res.redirect('/');
    }
})

app.post('/registerUser', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        //TODO - SANITIZE TEXT
        try {
            reg_handler.RegisterUser(username, password)
                .then(result => {
                    console.log('user registered successfully');
                    res.redirect('/');
                })
        } catch (error) {
            res.status(500).send();
        }
    }

})

app.post('/auth', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        login_handler.VerifyLogin(username, password)
            .then(result => {
                if (result) {
                    console.log('user login succcess');
                    req.session.loggedin = true;
                    req.session.username = result.username;
                    res.redirect('/verseoftheday')
                } else {
                    res.json({ success: 'fail' });
                }
            });
    }
})

app.get("/api/verse-day", (req, res) => {
    //used to see if the user has already liked it
    let username = req.session.username;

    let date = new Date();
    //+1 to account for indexing
    let day = date.getDay() + 1;
    let month = date.getMonth() + 1;
    let id = day.toString() + month.toString();

    let verseTitle;
    let verseContent;
    const verseIndex = new Date().getDate();

    verse_handler.getVerseKey(verseIndex).then((verseKeyData) => {
        verse_handler.getVerse(verseKeyData[0].verseKey, BIBLE_API_KEY).then((data) => {
            verseTitle = removeNonAlphabetic(data.reference);
            verseContent = removeNonAlphabetic(data.content);

            let verse = {
                title: verseTitle,
                body: verseContent,
                liked: true,
            };
            res.send(verse)
        });
    });
})

app.get("/api/verse-week", async (req, res) => {
    verse_handler.getVerses().then((data) => {
        const verses = data;
        const verseIndex = new Date().getDate();
        let startDay;

        verseIndex - 7 < 0 ? startDay = 0 : startDay = verseIndex - 7;

        let mostLikedIndex = startDay;
        for(let i = startDay; i <= verseIndex; i++)
        {
            if(verses[i].likes >= verses[mostLikedIndex].likes)
            {
                mostLikedIndex = i;
            }
        }

        let mostLikedVerseKey = verses[mostLikedIndex].verseKey;

        verse_handler.getVerse(mostLikedVerseKey, BIBLE_API_KEY).then((data) => {
            verseTitle = removeNonAlphabetic(data.reference);
            verseContent = removeNonAlphabetic(data.content);

            let verse = {
                title: verseTitle,
                body: verseContent,
            };
            res.send(verse)
        });
        
    });
})

app.patch("/api/liked/:isLiked", (req, res) => {
    let isLiked = req.params.isLiked; //boolean
    let username = req.session.username;
    //apply update to db with username and isLiked status

    res.send("Successfull")
})

app.get('/favorites/:user_id', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM VERSES WHERE id IN (SELECT verse_id FROM FAVORITES WHERE user_id IN (@user_id)');
        res.json(result.recordset);
    } catch (error) {
        console.log(error);
    }
});

app.post('/favorites/:user_id/:verse_id', async (req, res) => {
    const { user_id, verse_id } = req.query;
    try {
        const pool = await sql.connect(config);
        await pool
            .request()
            .input('user_id', sql.Int, user_id)
            .input('verse_id', sql.Int, verse_id)
            .query('INSERT INTO FAVORITES (user_id, verse_id) VALUES (@user_id, @verse_id)');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.delete('/favorites/:user_id/:verse_id', async (req, res) => {
    const { user_id, verse_id } = req.query;
    try {
        const pool = await sql.connect(config);
        await pool
            .request()
            .input('user_id', sql.Int, user_id)
            .input('verse_id', sql.Int, verse_id)
            .query('DELETE FROM FAVORITES WHERE user_id = @user_id AND verse_id = @verse_id');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(port, err => {
    if (err) {
        return console.log(err);
    }
    console.log(`Listening On ${port}`);

})

function removeNonAlphabetic(str) {
    str = str.replace(/^[^a-zA-Z]+/, '');
    return str.charAt(0).toUpperCase() + str.slice(1);
}


