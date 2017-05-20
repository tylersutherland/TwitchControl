chrome.tabs.query({"title": "*- Twitch"}, populateMenu);

function populateMenu(tabs) {
    tabs.forEach(function(tab) {
        // if tab looks like a twitch stream add it to the list
        if (isTwitchStream(tab)) {
            createSelectButton(tab);
            createPlayButton(tab);
            createRefreshButton(tab);
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
    return (userInTitle.toUpperCase() === userInUrl.toUpperCase());
}

function createSelectButton(tab) {
    var div = document.createElement("div");
    div.id = tab.id;
    div.textContent = tab.title;
    div.onclick = function (e) {
        console.log("switching to " + div.id + " " + div.innerText);
        chrome.windows.update(tab.windowId, {"focused": true});
        chrome.tabs.update(Number(div.id), {"active": true});
    };
    document.body.appendChild(div);
}

function createPlayButton(tab) {
    var div = document.createElement("div");
    div.textContent = "Play/Pause";
    div.onclick = function (e) {
        console.log("attempting to play/pause");
        chrome.tabs.executeScript(tab.id, {
            file: "play.js"
        });
    };
    document.body.appendChild(div);
}

function createRefreshButton(tab) {
    var div = document.createElement("div");
    div.textContent = "Refresh";
    div.onclick = function (e) {
        chrome.tabs.reload(tab.id);
    };
    document.body.appendChild(div);
}
