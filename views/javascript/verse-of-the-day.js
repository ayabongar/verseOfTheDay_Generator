const introText = "Here's the verse of the day!\n"

let main = document.getElementsByTagName("main")[0];
let likeButton = document.getElementsByClassName("like")[0];
let likeClicked = false;
let shareButton = document.getElementsByClassName("share")[0];
let loader = document.getElementsByClassName("loader")[0];

async function populateVerse() {
    let resObj = await fetch("/api/verse-day")
    let resJson = await resObj.json()
    
    let verse = document.getElementsByClassName("verse")[0];
    verse.getElementsByTagName("h1")[0].textContent = resJson.title;
    verse.getElementsByTagName("blockquote")[0].textContent = resJson.body;
    likeButton.classList.remove("hidden");
    shareButton.classList.remove("hidden");
    loader.classList.add("hidden");
    
    //handle if liked
    //api request to see if record exists for current user
    const liked = await fetch("favorite", {
        method:"GET"
    });
    let rows = await liked.json()
    if(rows[0]>=1){
        likeButton.classList.add("click");
        likeClicked = true;
    }
}

window.onload = populateVerse;

likeButton.addEventListener("click", async () => {
    if (!likeClicked) {
        likeButton.classList.add("click");
        likeClicked = !likeClicked;
        const handle = await fetch(`/favorites`,{
            method:"POST"
        })
        if (handle.ok){
            //all good
        }
    } else {
        likeButton.classList.remove("click");
        likeClicked = !likeClicked;
        const handle = await fetch(`/favorites`,{
            method:"DELETE"
        })
        if (handle.ok){
            //all good
        }
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