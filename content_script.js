var successCount = 0;
var youtubeSwapperRegex = new RegExp('youtube\\s*swapper\\s*:\\s*(.+)', 'i');
var VIDEO_ID = "<videoId>"
var bitchuteVideoRegex = new RegExp('https://www.bitchute.com/video/([a-zA-Z0-9\\-]+)');
var youtubeVideoRegex = new RegExp('https://www.youtube.com/watch\\?v=([a-zA-Z0-9\\-]+)');
var bitchuteEmbedTemplate = "https://www.bitchute.com/embed/" + VIDEO_ID + "/";
var youtubeEmbedTemplate = "https://www.youtube.com/embed/" + VIDEO_ID;
var YOUTUBE = "YouTube";
var BITCHUTE = "BitChute";

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (successCount == 1) {
		undoPriorVideoReplacement();
	}
	replaceYoutubeVideo();
});

async function replaceYoutubeVideo() {
	let videoElement = await getVideoElement();
	let description = await getYoutubeDescription();
	let swapData = parseDescription(description);
	if (videoElement != null && swapData != null) {
		videoElement.pause();
		videoElement.parentElement.parentElement.outerHTML =
			getReplacementVideoElement(videoElement, swapData).outerHTML;
		successCount = 1;
	} else {
		console.log("Video Element =");
		console.log(videoElement);
		console.log("Swap Data =");
		console.log(swapData);
		throw "Error: Couldn't replace video";
	}
}

async function getYoutubeDescription() {
	let scriptTag = await getScriptTag();
	if (scriptTag != null) {
		let description = parseScriptTag(scriptTag);
		return description;
	} else {
		throw "Error: Couldn't find YouTube description container";
	}
	console.log(scriptTag);
	return null;
}

function parseScriptTag(youtubeScriptTag) {
	return JSON.parse(youtubeScriptTag.innerText).description;
}

function getScriptTag() {
	return new Promise(resolve => {
		let interval = setInterval(() => {
			let scriptTag = document.getElementById("scriptTag");
			if (scriptTag != null) {
				resolve(scriptTag);
				clearInterval(interval);
			}
		}, 200);
		setTimeout(() => {
			clearInterval(interval);
			resolve(null);
		}, 5000)
	});
}

function getVideoElement() {
	return new Promise(resolve => {
		let interval = setInterval(() => {
			let videoElement = document.getElementsByTagName("VIDEO")[0];
			if (videoElement != null) {
				resolve(videoElement);
				clearInterval(interval);
			}
		}, 200);
		setTimeout(() => {
			clearInterval(interval);
			resolve(null);
		}, 5000)
	});
}

function parseDescription(description) {
	let lines = description.split('\n');
	for(let i = 0; i < lines.length; i++) {
		let match = lines[i].match(youtubeSwapperRegex);
		if (match != null) {
			return parseUrl(match[1]);
		}
	}
}

function parseUrl(url) {
	if (url != null) {
		if (url.match(bitchuteVideoRegex) != null) {
			let match = url.match(bitchuteVideoRegex);
			if (match[1] != null) {
				return ParsedUrl(BITCHUTE, match[1]);
			}
		} else if (url.match(youtubeVideoRegex) != null) {
			let match = url.match(youtubeVideoRegex);
			if (match[1] != null) {
				return ParsedUrl(YOUTUBE, match[1]);
			}
		}
	}
	throw "Unable to parse url \"" + url + "\""
}

function ParsedUrl(urlType, videoId) {
	return {type: urlType, id: videoId};
}

function getReplacementVideoElement(sourceVideoElement, swapData) {
	let newVideoElement = document.createElement("iframe");
	copyCSS(sourceVideoElement, newVideoElement);
	newVideoElement.src = getEmbedSource(swapData);
	return newVideoElement;
}

function copyCSS(sourceElement, destinationElement) {
	destinationElement.style.cssText = document.defaultView.getComputedStyle(sourceElement, "").cssText;
}

function getEmbedSource(swapData) {
	switch(swapData.type) {
		case BITCHUTE:
			return bitchuteEmbedTemplate.replace(VIDEO_ID, swapData.id);
			break;
		case YOUTUBE:
			return youtubeEmbedTemplate.replace(VIDEO_ID, swapData.id);
			break;
		default:
			throw "Unknown video type \"swapData.type\"";
			break;
	}
	return null;
}

function undoPriorVideoReplacement() {
	location.reload();
	successCount = 0;
}