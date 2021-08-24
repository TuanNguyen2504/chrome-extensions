const CARD_INFO_LS_KEY = 'card-info';

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

// main flow
$(document).ready(function () {
	const saveCardBtn = document.getElementById('saveCardBtn');
	const fillBtn = document.getElementById('fillBtn');
	const fastFillBtn = document.getElementById('fastFillBtn');

	// get credit card info
	getCardInfo();

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

	// when fill button click
	fillBtn.addEventListener('click', function () {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			const activeTab = tabs[0];
			chrome.tabs.sendMessage(activeTab.id, { msg: 'fill-card' });
		});
	});

	fastFillBtn.addEventListener('click', function () {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			const activeTab = tabs[0];
			chrome.tabs.sendMessage(activeTab.id, { msg: 'fast-fill-card' });
		});
	});
});
