//The API Key to the Bible API. Enter in the Key to the empty string
const API_KEY = ``;
const BIBLE_ID = `55212e3cf5d04d49-01`;
let verseTitle = '';
let verseContent = '';

//31 Different Bible verses to cater for each day of a month, can be extended
const bibleVerses = [
    'GEN.1.1',
    'EXO.20.2',
    'LEV.19.18',
    'NUM.6.24',
    'DEU.6.5',
    'JOS.1.9',
    'JDG.5.3',
    'RUT.1.16',
    '1SA.16.7',
    '2SA.22.31',
    '1KI.3.9',
    '2KI.20.5',
    '1CH.16.34',
    '2CH.7.14',
    'EZR.7.10',
    'NEH.8.10',
    'EST.4.14',
    'JOB.19.25',
    'PSA.1.1',
    'PRO.3.5',
    'ECC.3.1',
    'SNG.2.16',
    'ISA.9.6',
    'JER.29.11',
    'LAM.3.22',
    'EZK.36.26',
    'DAN.3.18',
    'HOS.6.6',
    'JOL.2.28',
    'AMO.5.24',
    'OBA.1.15'
];

//Getting the bible verse key for the day
const verseIndex = new Date().getDate();
const verseID = bibleVerses[verseIndex];

//Calling the function that makes the bible verse call to the api and setting the results
getResults(verseID).then((data) => {
    //This is the title of the verse
    verseTitle = removeNonAlphabetic(data.reference);

    //This is the actual content of the verse
    verseContent = removeNonAlphabetic(data.content);
});

//A function for formatting of the verse
function removeNonAlphabetic(str) {
    str = str.replace(/^[^a-zA-Z]+/, '');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//The api call to get the verse
function getResults(verseID) {
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