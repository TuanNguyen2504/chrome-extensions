/// <reference path="D:\tips\typings\jquery\globals\jquery\index.d.ts" />

const HISTORY_LS_KEY = 'auto-tab-history';
const CARD_INFO_LS_KEY = 'card-info';
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

function getCardInfo() {
	chrome.storage.sync.get([CARD_INFO_LS_KEY], function (data) {
		const cardInfo = JSON.parse(data[CARD_INFO_LS_KEY] || null) || null;
		console.log(cardInfo);
		if (cardInfo) {
			const { cardNumber, expireDate, cvv } = cardInfo;
			$('#cardNumber').val(cardNumber);
			$('#cardExpireDate').val(expireDate);
			$('#cvv').val(cvv);
		}
	});
}

async function renderHistoryList(history = []) {
	const historyListXML = $('#historyList');

	if (history.length === 0) {
		historyListXML.html(
			'<span class="no-history">Chưa có lưu trữ nào. Bấm "Lưu lại" để tạo lưu trữ mới !</span>',
		);
	} else {
		let xml = '';
		history.forEach((item) => {
			xml += `<li data-id="${item.id}" class="history-item">${item.createdDate}</li>`;
		});
		historyListXML.html(xml);

		// when history item click
		$('.history-item').on('click', function () {
			const id = this.getAttribute('data-id');
			const urlList = oldHistoryList.find((i) => i.id == id)?.urlList || [];

			let content = '';
			urlList.forEach((url) => (content += url + '\n'));
			$('#linkInput').val(content);
			$('#countLink').text(urlList.length.toString());
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
$(document).ready(function () {
	const openBtn = document.getElementById('openBtn');
	const saveBtn = document.getElementById('saveBtn');
	const saveCardBtn = document.getElementById('saveCardBtn');
	const clearHistoryBtn = document.getElementById('clearHistory');
	const linkInput = document.getElementById('linkInput');

	// get and render history list
	getHistoryList().then((data) => {
		oldHistoryList = JSON.parse(data || null) || [];
		renderHistoryList(oldHistoryList);
	});

	// get credit card info
	getCardInfo();

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
		if (urls.length === 0) return;

		const urlList = splitUrls(urls);
		const newItem = {
			id: oldHistoryList.length + 1,
			createdDate: formatDate(new Date()),
			urlList,
		};
		const newHistoryList = [newItem, ...oldHistoryList];

		oldHistoryList = [...newHistoryList];
		renderHistoryList(newHistoryList);
		chrome.storage.sync.set({
			[HISTORY_LS_KEY]: JSON.stringify(newHistoryList),
		});
	});

	// when click save credit card
	saveCardBtn.addEventListener('click', function () {
		const cardNumber = $('#cardNumber').val();
		const expireDate = $('#cardExpireDate').val();
		const cvv = $('#cvv').val();

		const newCard = { cardNumber, expireDate, cvv };
		saveCardBtn.textContent = 'Đã lưu thẻ';
		chrome.storage.sync.set({
			[CARD_INFO_LS_KEY]: JSON.stringify(newCard),
		});
	});

	// clear history click
	clearHistoryBtn.addEventListener('click', function () {
		chrome.storage.sync.clear();
		oldHistoryList = [];
		renderHistoryList([]);
	});
});
