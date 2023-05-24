const introText = "Here's the verse of the day!\n"

let main = document.getElementsByTagName("main")[0];
let likeButton = document.getElementsByClassName("like")[0];
let likeClicked = false;
let shareButton = document.getElementsByClassName("share")[0];

async function populateVerse() {
    //make api call
    let title = "";
    let content = "";
    let resObj = await fetch("/api/verse-day")
    let resJson = await resObj.json()
    
    let verse = document.getElementsByClassName("verse")[0];
    verse.getElementsByTagName("h1")[0].textContent = resJson.title;
    verse.getElementsByTagName("blockquote")[0].textContent = resJson.body;
    
    //handle if liked
    likeClicked = resJson.liked;
    likeButton.classList.add("click");
}

window.onload = populateVerse;

likeButton.addEventListener("click", async () => {
    if (!likeClicked) {
        likeButton.classList.add("click");
        likeClicked = !likeClicked;
    } else {
        likeButton.classList.remove("click");
        likeClicked = !likeClicked;
    }
    const handle = await fetch(`/api/liked/${likeClicked}`,{
        method:"PATCH"
    })
    if (handle.ok){
        //all good
    }else{
        alert("There is an issue with the database, please try again");
    }
})

shareButton.addEventListener("click", (e) => {
    let verseContainer = document.getElementsByClassName("verse")[0];
    let title = verseContainer.getElementsByTagName('h1')[0];
    let body = verseContainer.getElementsByTagName('blockquote')[0];

    let text = `${introText}${title.textContent}\n${body.textContent}`;
    if (navigator.share) {
        navigator.share({
            title: title.textContent,
            text: body.textContent,
            url: window.location
        });
        return;
    }
    navigator.clipboard.writeText(text);
    popup(e, "Copied to clipboard!");
})

function popup(e, text) {
    //Get position of cursor
    let y = e.clientY - 8;
    let x = e.clientX + 30;

    let popupText = document.createElement("dialog");

    popupText.classList.add("popup");
    popupText.textContent = text;
    popupText.style.opacity = 1;
    popupText.style.position = "absolute";
    popupText.style.top = y + "px";
    popupText.style.left = x + "px";

    main.appendChild(popupText)

    let interval = setInterval(() => {
        popupText.style.opacity = popupText.style.opacity - 0.02;
    }, 10)

    let timeout = setTimeout(() => {
        main.removeChild(popupText);
        clearInterval(interval);
    }, 800);
}

//The API Key to the Bible API. Enter in the Key to the empty string
let API_KEY;
let verseTitle;
let verseContent;
const BIBLE_ID = `55212e3cf5d04d49-01`;

async function getVerse() {
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
}
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