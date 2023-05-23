const sql = require('msnodesqlv8');
const connectionString = 'server=KYLEP\\SQLEXPRESS;Database=BibleApp;Trusted_Connection=Yes;Driver={SQL Server}';
const XMLHttpRequest = require('xhr2');

function getVerse(verseKey, BIBLE_API_KEY) {
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
            `https://api.scripture.api.bible/v1/bibles/55212e3cf5d04d49-01/verses/${verseKey}?content-type=text&include-chapter-numbers=false`
        );
        xhr.setRequestHeader(`api-key`, BIBLE_API_KEY);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}

async function getVerseKey(verseID) {
    return new Promise((resolve, reject) => {
        sql.query(connectionString,
            `SELECT v.verseKey FROM VERSES v WHERE v.id='${verseID}'`
            , (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            })
    });
};

async function getVerses() {
    return new Promise((resolve, reject) => {
        sql.query(connectionString,
            `SELECT * FROM VERSES`
            , (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            })
    });
};

module.exports = {getVerse, getVerseKey, getVerses};