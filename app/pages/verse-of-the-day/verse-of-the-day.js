//The API Key to the Bible API. Enter in the Key to the empty string
let API_KEY;
let verseTitle;
let verseContent;
const BIBLE_ID = `55212e3cf5d04d49-01`;

fetch('/verse-keys.txt')
    .then(response => response.text())
    .then(data => {
        const verseKeys = data.split(',');

        //31 Different Bible verses to cater for each day of a month, can be extended
        const bibleVerses = verseKeys.map(str => str.replace(/\r?\n|\r/g, ''));

        //Getting the bible verse key for the day
        const verseIndex = new Date().getDate();
        const verseID = bibleVerses[verseIndex];

        fetch('/bible-api-key.txt')
            .then(response => response.text())
            .then(data => {
                API_KEY = data;

                //Calling the function that makes the bible verse call to the api and setting the results
                if (API_KEY != '') {
                    getResults(verseID, API_KEY).then((data) => {
                        //This is the title of the verse
                        verseTitle = removeNonAlphabetic(data.reference);

                        //This is the actual content of the verse
                        verseContent = removeNonAlphabetic(data.content);

                        //Set the html tags here:
                        console.log(verseTitle);
                        console.log(verseContent);
                    });
                }
            })
            .catch(error => {
                console.log('Error fetching bible api key: ', error);
            });
    })
    .catch(error => {
        console.log('Error fetching bible verse keys: ', error);
    });

//A function for formatting of the verse
function removeNonAlphabetic(str) {
    str = str.replace(/^[^a-zA-Z]+/, '');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//The api call to get the verse
function getResults(verseID, API_KEY) {
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
            `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/verses/${verseID}?content-type=text&include-chapter-numbers=false`
        );
        xhr.setRequestHeader(`api-key`, API_KEY);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}