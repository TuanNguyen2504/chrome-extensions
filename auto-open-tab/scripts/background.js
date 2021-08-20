const DELAY_TIME = 500;

function sleep(time = DELAY_TIME) {
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
			await sleep(DELAY_TIME);
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
