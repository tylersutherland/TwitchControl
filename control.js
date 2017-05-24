var video = document.getElementsByTagName("video")[0];
// When changing between differnt streams on the same tab like clicking on another channel on twitch another video element is changed so we need
// a ref to the div that the video is added to so that we can update the var when changing the page in this way
var videoDiv = document.getElementsByClassName("js-player-persistent ember-view")[0];
var playButton = document.getElementsByClassName("player-button player-button--playpause js-control-playpause-button")[0];
var muteButton = document.getElementsByClassName("player-button player-button--volume qa-control-volume")[0];
// For whatever reason the volume slider is a div the current value is aria-valuenow
var volumeSlider = document.getElementsByClassName("player-volume__slider player-slider")[0];

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message == "twitchcontrol:hello") {
            sendResponse({"message": "hi"});
        } else if (request.message == "twitchcontrol:volume") {
            setVolume(request.volume, request.muted);
        } else if (request.message == "twitchcontrol:play") {
            playPause();
            sendResponse({"paused": video.paused});
        } else if (request.message == "twitchcontrol:getplaystate") {
            sendResponse({"paused": video.paused});
        } else if (request.message == "twitchcontrol:getvolumestate") {
            sendResponse({"muted": video.muted, "volume": video.volume});
        }
});

videoDiv.addEventListener("DOMCharacterDataModified", function() {
    video = document.getElementsByTagName("video")[0];
    muteButton = document.getElementsByClassName("player-button player-button--volume qa-control-volume")[0]
});

// I don't use playbutton.click because that also refreshes the stream instead of resuming where paused
function playPause() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}
function setVolume(volume, muted) {
    // checks to see if the video is being muted or unmuted to update the mute button on twitch to try and stay in sync 
    if (((volume != video.volume) && (volume == 0 || video.volume == 0))
         || ((video.muted && volume > 0) || (!video.muted && volume == 0))) {
        muteButton.click();
    }
    video.muted = muted;
    video.volume = volume;
}
