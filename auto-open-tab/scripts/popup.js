const HISTORY_LS_KEY = 'auto-tab-history';
const CARD_INFO_LS_KEY = 'card-info';
const AUTO_MODE_LS_KEY = 'auto-mode';
const AUTO_DONE_LS_KEY = 'auto-done';
const TIME_LS_KEY = 'time';
const DEFAULT_TIME = {
	OPEN_TAB: 3000,
	CLICK_BUY: 3000,
	FILL_PAYMENT: 250,
};

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

function toggleAutoMode() {
	const autoBtn = $('#toggleAutoBtn');

	if (autoBtn.hasClass('btn-onauto')) {
		autoBtn.removeClass('btn-onauto').addClass('btn-offauto');
		autoBtn.text('Auto Mode: Off');
		chrome.storage.sync.set({ [AUTO_MODE_LS_KEY]: 'off' });
	} else {
		autoBtn.removeClass('btn-offauto').addClass('btn-onauto');
		autoBtn.text('Auto Mode: On');
		chrome.storage.sync.set({ [AUTO_MODE_LS_KEY]: 'on' });
	}
}

function toggleAutoDone() {
	const autoBtn = $('#autoDoneBtn');

	if (autoBtn.hasClass('btn-onauto')) {
		autoBtn.removeClass('btn-onauto').addClass('btn-offauto');
		autoBtn.text('Auto Done: Off');
		chrome.storage.sync.set({ [AUTO_DONE_LS_KEY]: 'off' });
	} else {
		autoBtn.removeClass('btn-offauto').addClass('btn-onauto');
		autoBtn.text('Auto Done: On');
		chrome.storage.sync.set({ [AUTO_DONE_LS_KEY]: 'on' });
	}
}

function getAutoMode() {
	chrome.storage.sync.get([AUTO_MODE_LS_KEY], function (data) {
		if (data[AUTO_MODE_LS_KEY] === 'off') {
			$('#toggleAutoBtn')
				.removeClass('btn-onauto')
				.addClass('btn-offauto')
				.text('Auto Mode: Off');
		}
	});
	chrome.storage.sync.get([AUTO_DONE_LS_KEY], function (data) {
		if (data[AUTO_DONE_LS_KEY] === 'on') {
			$('#autoDoneBtn')
				.removeClass('btn-offauto')
				.addClass('btn-onauto')
				.text('Auto Done: On');
		}
	});
}

function getAndSetTimeDefault() {
	chrome.storage.sync.get([TIME_LS_KEY], function (data) {
		if (!data[TIME_LS_KEY]) {
			const defTime = {
				openTab: DEFAULT_TIME.OPEN_TAB,
				clickBuy: DEFAULT_TIME.CLICK_BUY,
				fillPayment: DEFAULT_TIME.FILL_PAYMENT,
			};
			$('#timeOpenTab').val(DEFAULT_TIME.OPEN_TAB / 1000);
			$('#timeClickBuy').val(DEFAULT_TIME.CLICK_BUY / 1000);
			$('#timeFillPayment').val(DEFAULT_TIME.FILL_PAYMENT / 1000);
			chrome.storage.sync.set({ [TIME_LS_KEY]: JSON.stringify(defTime) });
		} else {
			const { openTab, clickBuy, fillPayment } = JSON.parse(data[TIME_LS_KEY]);
			$('#timeOpenTab').val(openTab / 1000);
			$('#timeClickBuy').val(clickBuy / 1000);
			$('#timeFillPayment').val(fillPayment / 1000);
		}
	});
}

function resetAll() {
	chrome.storage.sync.clear();
	$('#linkInput').val('');
	$('#cardNumber').val('');
	$('#cardExpireDate').val('');
	$('#cvv').val('');
	getAndSetTimeDefault();
	oldHistoryList = [];
	renderHistoryList([]);
}

function timeOpenTabChange(e) {
	const val = e.target.value * 1000;
	const newTime = {
		openTab: val,
		clickBuy: $('#timeClickBuy').val() * 1000,
		fillPayment: $('#timeFillPayment').val() * 1000,
	};
	chrome.storage.sync.set({ [TIME_LS_KEY]: JSON.stringify(newTime) });
}

function timeClickBuyChange(e) {
	const val = e.target.value * 1000;
	const newTime = {
		openTab: $('#timeOpenTab').val() * 1000,
		clickBuy: val,
		fillPayment: $('#timeFillPayment').val() * 1000,
	};
	chrome.storage.sync.set({ [TIME_LS_KEY]: JSON.stringify(newTime) });
}

function timeFillPaymentChange(e) {
	const val = e.target.value * 1000;
	const newTime = {
		openTab: $('#timeOpenTab').val() * 1000,
		clickBuy: $('#timeClickBuy').val() * 1000,
		fillPayment: val,
	};
	chrome.storage.sync.set({ [TIME_LS_KEY]: JSON.stringify(newTime) });
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

	// get auto mode
	getAutoMode();

	// get credit card info
	getCardInfo();

	// set default time
	getAndSetTimeDefault();

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

	// toggle auto mode
	$('#toggleAutoBtn').click(toggleAutoMode);

	// toggle auto done
	$('#autoDoneBtn').click(toggleAutoDone);

	// clear history click
	clearHistoryBtn.addEventListener('click', function () {
		chrome.storage.sync.set({ [HISTORY_LS_KEY]: null });
		oldHistoryList = [];
		renderHistoryList([]);
	});

	// reset all cache
	$('#resetAll').click(resetAll);

	// time change
	$('#timeOpenTab').change(timeOpenTabChange);
	$('#timeClickBuy').change(timeClickBuyChange);
	$('#timeFillPayment').change(timeFillPaymentChange);
});
