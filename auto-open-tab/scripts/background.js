let DEF_DELAY_TIME = 4000;
const TIME_LS_KEY = 'time';

function getTimeDelay() {
	return new Promise((resolve) => {
		chrome.storage.sync.get([TIME_LS_KEY], function (data) {
			if (data[TIME_LS_KEY]) {
				const { openTab } = JSON.parse(data[TIME_LS_KEY]);
				resolve(openTab);
			} else {
				resolve(DEF_DELAY_TIME);
			}
		});
	});
}

function sleep(time = DEF_DELAY_TIME) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, time);
	});
}

async function openUrlsNewTab(urlList = []) {
	if (Array.isArray(urlList) && urlList.length) {
		const l = urlList.length;
		for (let i = 0; i < l; ++i) {
			window.open(urlList[i], '_blank');
			await sleep(await getTimeDelay());
		}
	}
}

// open new tab
chrome.runtime.onMessage.addListener(function (request) {
	if (request.msg === 'open-tab') {
		const urlList = request.data;
		openUrlsNewTab(urlList);
	}
});
