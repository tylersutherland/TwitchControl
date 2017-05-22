chrome.tabs.query({"title": "*- Twitch"}, populateMenu);

function populateMenu(tabs) {
    tabs.forEach(function(tab) {
        // if tab looks like a twitch stream add it to the list
        if (isTwitchStream(tab)) {
            //check to make sure the script hasn't already injected otherwise the script will attempt to do things multiple times
            chrome.tabs.sendMessage(tab.id, {"message": "twitchcontrol:hello"}, function(response) {
                if (!response) {
                    chrome.tabs.executeScript(tab.id, {
                        "file": "control.js"
                    });
                }
                var div = document.createElement("div");
                div.className = "control";
                createSelectButton(tab, div);
                createPlayButton(tab, div);
                createRefreshButton(tab, div);
                createVolumeControl(tab, div);
                document.body.appendChild(div);
            });
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
    selectButton.title = "Switch to this stream";
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
    chrome.tabs.sendMessage(tab.id, {"message": "twitchcontrol:getplaystate"}, function (response) {
            playButton.className = response.paused ? "play" : "pause";
            playButton.title = playButton.className == "play" ? "Play" : "Pause";
    });
    playButton.onclick = function (e) {
        console.log("attempting to play/pause");
        chrome.tabs.sendMessage(tab.id, {"message": "twitchcontrol:play"});
        playButton.className = playButton.className == "play" ? "pause" : "play";  
        playButton.title = playButton.className == "play" ? "Play" : "Pause"; 
    };
    div.appendChild(playButton);
}

function createRefreshButton(tab, div) {
    var refreshButton = document.createElement("button");
    refreshButton.className = "refresh";
    refreshButton.title = "Refresh";
    refreshButton.onclick = function (e) {
        chrome.tabs.reload(tab.id);
    };
    div.appendChild(refreshButton);
}

function createVolumeControl(tab, div) {
    var volumeControlDiv = document.createElement("div");
    volumeControlDiv.className = "volume";
    var mute = document.createElement("button");
    mute.className = "notmuted";
    var control = document.createElement("input");
    var volume = 0.5;
    var muted = false;
    chrome.tabs.sendMessage(tab.id, {"message": "twitchcontrol:getvolumestate"}, function(response) {
        volume = response.volume;
        muted = response.muted;
        control.value = muted ? 0 : volume;
        mute.className = muted ? "muted" : "notmuted";
        mute.title = muted ? "Unmute" : "Mute";
    });
    control.min = 0;
    control.max = 1;
    control.step = 0.01;
    control.type = "range";
    control.oninput = function () {
        volume = control.value;
        muted = volume == 0;
        chrome.tabs.sendMessage(tab.id, {"message": "twitchcontrol:volume", "volume": volume, "muted": muted});
        updateVolumeControls(volume, muted, control, mute);
    };
    mute.onclick = function () {
        muted = !muted;
        chrome.tabs.sendMessage(tab.id, {"message": "twitchcontrol:volume", "volume": volume, "muted": muted});
        updateVolumeControls(volume, muted, control, mute);
    }
    volumeControlDiv.appendChild(mute);
    volumeControlDiv.appendChild(control);
    div.appendChild(volumeControlDiv);
}

function updateVolumeControls(volume, muted, control, mute) {
    if (muted) {
        control.value = 0;
        mute.className = "muted";
    } else {
        control.value = volume;
        mute.className = "notmuted";
    }
    mute.title = muted ? "Unmute" : "Mute";
}
