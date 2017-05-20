var video = document.getElementsByTagName("video")[0];
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message == "twitchcontrol:hello") {
            sendResponse({"content": "hi"});
        } else if (request.message == "twitchcontrol:volume") {
            video.muted = false;
            video.volume = request.value;
        }
});