const HISTORY_LS_KEY = 'auto-tab-history';
let oldHistoryList = [];
let TIMEOUT_ID = null;

// helper function
function splitUrls(urls = '') {
	if (typeof urls !== 'string' || urls.length === 0) return [];

	const urlList = urls
		.trim()
		.split(/\s/)
		.filter((url) => url.length > 0);

	return urlList;
}

function formatDate(date = new Date()) {
	const h = `0${date.getHours()}`.slice(-2);
	const m = `0${date.getMinutes()}`.slice(-2);
	const d = `0${date.getDate()}`.slice(-2);
	const mth = `0${date.getMonth() + 1}`.slice(-2);
	const y = date.getFullYear();
	return `${h}:${m} ${d}-${mth}-${y}`;
}

function getHistoryList() {
	return new Promise((resolve) => {
		chrome.storage.sync.get([HISTORY_LS_KEY], function (data) {
			resolve(data[HISTORY_LS_KEY]);
		});
	});
}

async function renderHistoryList(history = []) {
	const historyListXML = document.getElementById('historyList');

	if (history.length === 0) {
		historyListXML.innerHTML =
			'<span class="no-history">Chưa có lưu trữ nào. Bấm "Lưu lại" để tạo lưu trữ mới !</span>';
	} else {
		let xml = '';
		history.forEach((item) => {
			xml += `<li data-id="${item.id}" class="history-item">${item.createdDate}</li>`;
		});
		historyListXML.innerHTML = xml;

		// when history item click
		document
			.querySelector('.history-item')
			.addEventListener('click', function () {
				const id = this.getAttribute('data-id');
				const urlList = oldHistoryList.find((i) => i.id == id)?.urlList || [];
				let content = '';
				urlList.forEach((url) => (content += url + '\n'));
				document.getElementById('linkInput').value = content;
				document.getElementById('countLink').innerText =
					urlList.length.toString();
			});
	}
}

function debounce(cbFn) {
	if (TIMEOUT_ID) clearTimeout(TIMEOUT_ID);
	TIMEOUT_ID = window.setTimeout(() => {
		cbFn();
	}, 0);
}

// main flow
document.addEventListener('DOMContentLoaded', function () {
	const openBtn = document.getElementById('openBtn');
	const saveBtn = document.getElementById('saveBtn');
	const clearHistoryBtn = document.getElementById('clearHistory');
	const linkInput = document.getElementById('linkInput');

	// get and render history list
	getHistoryList().then((data) => {
		oldHistoryList = JSON.parse(data || null) || [];
		renderHistoryList(oldHistoryList);
	});

	// count link when textarea change
	linkInput.addEventListener('change', function () {
		const val = this.value;

		debounce(() => {
			const count = splitUrls(val).length;
			document.getElementById('countLink').innerText = count;
		});
	});

	// when click open button
	openBtn.addEventListener('click', function () {
		const urls = linkInput.value || '';

		if (urls.length) {
			const urlList = splitUrls(urls);
			chrome.runtime.sendMessage({
				msg: 'open-tab',
				data: urlList,
			});
		}
	});

	// when click save button
	saveBtn.addEventListener('click', async function () {
		const urls = linkInput.value || '';
		const urlList = splitUrls(urls);
		const newItem = {
			id: oldHistoryList.length + 1,
			createdDate: formatDate(new Date()),
			urlList,
		};
		const newHistoryList = [newItem, ...oldHistoryList];

		renderHistoryList(newHistoryList);
		chrome.storage.sync.set({
			[HISTORY_LS_KEY]: JSON.stringify(newHistoryList),
		});
	});

	// clear history click
	clearHistoryBtn.addEventListener('click', function () {
		chrome.storage.sync.clear();
		oldHistoryList = [];
		renderHistoryList([]);
	});
});
