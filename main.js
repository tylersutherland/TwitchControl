console.log("Hello world");
chrome.tabs.query({"title": "*- Twitch"}, populateMenu);

function populateMenu(tabs) {
    tabs.forEach(function(tab) {
        // if tab looks like a twitch stream add it to the list
        if (isTwitchStream(tab)) {
            var div = document.createElement("div");
            div.id = tab.id;
            div.textContent = tab.title;
            div.onclick = function (e) {
                console.log("clicked " + div.id + " "  + div.innerText);
                chrome.tabs.update(Number(div.id), {active: true});
            };
            document.body.appendChild(div);
        }
    });
}

/*  checks if the channel name in the url is the same as the title
 *  this is most likely not a good way to check if the page is a stream of not
 *  but it's what i'll use to start
 */
function isTwitchStream(tab) {
    var userInTitle = tab.title.split(" - Twitch")[0];
    var userInUrl = tab.url.split("/")[3];
    console.log(userInTitle.toUpperCase());
    console.log(userInUrl.toUpperCase());
    console.log(userInTitle.toUpperCase() === userInUrl.toUpperCase());
    return (userInTitle.toUpperCase() === userInUrl.toUpperCase());
}
