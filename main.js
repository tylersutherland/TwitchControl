chrome.tabs.query({"title": "*- Twitch"}, populateMenu);

function populateMenu(tabs) {
    tabs.forEach(function(tab) {
        // if tab looks like a twitch stream add it to the list
        if (isTwitchStream(tab)) {
            var div = document.createElement("div");
            div.className = "control";
            createSelectButton(tab, div);
            createPlayButton(tab, div);
            createRefreshButton(tab, div);
            createVolumeControl(tab, div);
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
    return (userInTitle.toUpperCase() === userInUrl.toUpperCase());
}

function createSelectButton(tab, div) {
    var selectButton = document.createElement("button");
    selectButton.className = "select";
    selectButton.textContent = tab.title.split(" -")[0];
    selectButton.onclick = function (e) {
        console.log("switching to " + tab.id + " " + tab.title);
        chrome.windows.update(tab.windowId, {"focused": true});
        chrome.tabs.update(Number(tab.id), {"active": true});
    };
    div.appendChild(selectButton);
}

function createPlayButton(tab, div) {
    var playButton = document.createElement("button");
    playButton.className = "play";
    playButton.textContent = "Play/Pause";
    playButton.onclick = function (e) {
        console.log("attempting to play/pause");
        chrome.tabs.executeScript(tab.id, {
            "file": "play.js"
        });
    };
    div.appendChild(playButton);
}

function createRefreshButton(tab, div) {
    var refreshButton = document.createElement("button");
    refreshButton.className = "refresh";
    refreshButton.textContent = "Refresh";
    refreshButton.onclick = function (e) {
        chrome.tabs.reload(tab.id);
    };
    div.appendChild(refreshButton);
}

function createVolumeControl(tab, div) {
    var volumeControlDiv = document.createElement("div");
    volumeControlDiv.className = "volume";
    volumeControlDiv.textContent = "Mute";
    var mute = document.createElement("input");
    mute.type = "checkbox";
    var control = document.createElement("input");
    var output = document.createElement("output");
    control.min = 0;
    control.max = 1;
    control.step = 0.1;
    control.type = "range";
    control.oninput = function () {
        output.value = control.value;
        mute.checked = false;
        updateVolume(tab.id, output.value);
    };
    mute.onclick = function () {
        if (mute.checked) {
            output.value = 0;
        } else {
            output.value = control.value;
        }
        updateVolume(tab.id, output.value);
    }
    output.value = control.value;
    volumeControlDiv.appendChild(mute);
    volumeControlDiv.appendChild(control);
    volumeControlDiv.appendChild(output);
    div.appendChild(volumeControlDiv);
}

function updateVolume(tabId, value) {
    chrome.tabs.sendMessage(tabId, {"message": "twitchcontrol:hello"}, function (response) {
        if (response) {
            chrome.tabs.sendMessage(tabId, {"message": "twitchcontrol:volume", "value": value});
        } else {
            console.log("inject volume script ");
            chrome.tabs.executeScript(tabId, {
                "file": "volume.js"
            });
        }
    });
}
