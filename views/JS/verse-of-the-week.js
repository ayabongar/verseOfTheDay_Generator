const introText = "Here's a verse I love!\n"

let main = document.getElementsByTagName("main")[0];
let likeButton = document.getElementsByClassName("like")[0];
let likeClicked = false;
let shareButton = document.getElementsByClassName("share")[0];

function populateVerses() {
    //make api call to fetch most voted for the week
    let title = "John 3:16";
    let content = "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not " +
        "perish but have eternal life.";
    let verse = document.getElementsByClassName("verse")[0];
    verse.getElementsByTagName("h1")[0].textContent = title;
    verse.getElementsByTagName("blockquote")[0].textContent = content;
}

window.onload = populateVerses;

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