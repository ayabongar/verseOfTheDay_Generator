const express = require('express');
const app = express();
const port = process.env.port || 8080;
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const XMLHttpRequest = require('xhr2');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
require('dotenv').config()

let sqlConfig = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_SERVER,
    database: process.env.DATABASE,
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
};

const BIBLE_API_KEY = process.env.BIBLE_API_KEY;

app.use(session({
    secret: 'secret',
    resave: false, //for every req create new session even if same user
    saveUninitialized: false, //if not touched session do not save
    cookie: { path: '/', httpOnly: true, maxAge: 30000 }
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
        try {
            RegisterUser(username, password)
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
        VerifyLogin(username, password)
            .then(result => {
                if (result) {
                    console.log('user login succcess');
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/verseoftheday')
                } else {
                    res.json({ success: 'fail' });
                }
            });
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.get("/api/verse-day", (req, res) => {
    let id = getID();

    let verseTitle;
    let verseContent;

    getVerseKey(id).then((verseKeyData) => {
        getVerse(verseKeyData[0], BIBLE_API_KEY).then((data) => {
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
    getVerseOfTheWeek().then((data) => {
        const verseID = data[0].verse_id;
        getVerseKey(verseID).then((verseKeyData) => {
            getVerse(verseKeyData[0], BIBLE_API_KEY).then((data) => {
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

    });
})

app.get('/favorites/:user_id', async (req, res) => {
    try {
        const pool = await sql.connect(sqlConfig);
        const result = await pool.request().query('SELECT * FROM VERSES WHERE id IN (SELECT verse_id FROM FAVORITES WHERE user_id IN (@user_id)');
        res.json(result.recordset);
    } catch (error) {
        console.log(error);
    }
});

app.post('/favorites', async (req, res) => {
    //verse id is just the date, day
    const verse_id = getID();
    const username = req.session.username;
    console.log("updating favourite for user: " + username)
    try {
        const pool = await sql.connect(sqlConfig);
        await pool
            .request()
            .input('username', sql.VarChar, username)
            .input('verse_id', sql.VarChar, verse_id)
            .query('INSERT INTO FAVORITES (user_id, verse_id) VALUES ((SELECT id FROM USERS where username = @username), @verse_id)');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }

});

app.get('/favorite', async (req, res) => {
    const username = req.session.username;
    let verse_id = getID();
    try {
        const pool = await sql.connect(sqlConfig);
        const result = await pool
            .request()
            .input('username', sql.VarChar, username)
            .input('verse_id', sql.VarChar, verse_id)
            .query('SELECT * FROM FAVORITES WHERE user_id=(SELECT id FROM USERS where username = @username) AND verse_id=@verse_id');
        res.json(result.rowsAffected);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
})

app.delete('/favorites', async (req, res) => {
    const verse_id = 24;
    const username = req.session.username;
    console.log("Deleting favourite for user: " + username)
    try {
        const pool = await sql.connect(sqlConfig);
        await pool
            .request()
            .input('username', sql.VarChar, username)
            .input('verse_id', sql.VarChar, verse_id)
            .query('DELETE FROM FAVORITES WHERE user_id = (SELECT id FROM USERS where username = @username) AND verse_id = @verse_id');
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

async function GetUserByUserName(username) {
    return new Promise(async (resolve, reject) => {
        try {
            let connection = await sql.connect(sqlConfig);

            let resultSet = await connection.request().query(`SELECT u.username, u.password FROM USERS u WHERE u.username='${username}'`);
            resolve(resultSet.recordset);
            connection.close();
        }
        catch (err) {
            console.error(err.message);
        }
    });
};

async function VerifyLogin(username, password) {
    let result = await GetUserByUserName(username);
    if (result.length !== 0) {
        let db_password = result[0].password;
        try {
            if (await bcrypt.compare(password, db_password)) {
                return true;
            }
        } catch (error) {
            console.log(error);
        }
    }

    return false;
}

async function AddUser(username, password) {
    const hashedPassword = await EncryptPassword(password);
    return new Promise(async (resolve, reject) => {
        try {
            let connection = await sql.connect(sqlConfig);
            let resultSet = await connection.request().query(`INSERT INTO dbo.USERS (username, password) VALUES ('${username}','${hashedPassword}');`);
            resolve(resultSet.recordset);
            connection.close();
        }
        catch (err) {
            console.error(err.message);
        }
    })
};

async function RegisterUser(username, password) {
    let result = await AddUser(username, password);
}

async function EncryptPassword(password) {
    try {
        //Add new encryption here
        let saltbae = await bcrypt.genSalt();
        let hashbrown = await bcrypt.hash(password, saltbae);
        let hashedPassword = hashbrown;
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}

function getVerse(verseKey, BIBLE_API_KEY) {
    let verse = verseKey.Book + "." + verseKey.chapter + "." + verseKey.startVerse;
    //not liking this in the req, doesnt seem to work with EndVerse
    // if(verseKey.EndVerse !== undefined || verseKey.EndVerse !== null){
    //     verse += "-"+verseKey.EndVerse
    // }
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener(`readystatechange`, function () {
            if (this.readyState === this.DONE) {
                const { data } = JSON.parse(this.responseText);
                resolve(data);
            }
        });
        xhr.open(
            `GET`,
            `https://api.scripture.api.bible/v1/bibles/55212e3cf5d04d49-01/verses/${verse}?content-type=text&include-chapter-numbers=false`
        );
        xhr.setRequestHeader(`api-key`, BIBLE_API_KEY);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}

async function getVerseKey(verseID) {
    return new Promise(async (resolve, reject) => {
        try {
            let connection = await sql.connect(sqlConfig);
            let resultSet = await connection.request().query(`SELECT * FROM VERSES v WHERE v.id='${verseID}'`);
            console.log(resultSet)
            resolve(resultSet.recordset);
            connection.close();
        }
        catch (err) {
            console.error(err.message);
        }
    });
};

//not used, didnt know if i could remove or not
async function getVerses() {
    return new Promise(async (resolve, reject) => {
        try {
            let connection = await sql.connect(sqlConfig);
            let resultSet = await connection.request().query(`SELECT * FROM FAVOURITE`);

            resolve(resultSet.recordset);
            connection.close();
        }
        catch (err) {
            console.error(err.message);
        }
    });
};

async function getVerseOfTheWeek() {
    return new Promise(async (resolve, reject) => {
        try {
            let connection = await sql.connect(sqlConfig);
            let resultSet = await connection.request().query(`SELECT TOP 1 verse_id FROM FAVORITES GROUP BY verse_id ORDER BY COUNT(verse_id) DESC`);

            resolve(resultSet.recordset);
            connection.close();
        }
        catch (err) {
            console.error(err.message);
        }
    });
};

function removeNonAlphabetic(str) {
    str = str.replace(/^[^a-zA-Z]+/, '');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getID() {
    let date = new Date();
    let day = (date.getUTCDate()).toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let id = month + day
    return id;
}
