/// <reference path="D:\tips\typings\jquery\globals\jquery\index.d.ts" />

const BUY_IT_ID = 'binBtn_btn';
const PAYMENT_OPTION_SELECTOR = 'input[title="Add new card"]';
const AUTO_MODE_LS_KEY = 'auto-mode';
const AUTO_DONE_LS_KEY = 'auto-done';
const TIME_LS_KEY = 'time';

let CARD_NUMBER = '1111111111111111';
let EXPIRE_DATE = '01/01';
let CVV_CODE = '111';
const CARD_INFO_LS_KEY = 'card-info';

let DELAY_AUTO_FILL_TIME = 250;
let DELAY_CLICK_BUY_TIME = 3000;

function sleep(time = DELAY_AUTO_FILL_TIME) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, time);
	});
}

function getTimeDelay() {
	chrome.storage.sync.get([TIME_LS_KEY], function (data) {
		if (data[TIME_LS_KEY]) {
			const { clickBuy, fillPayment } = JSON.parse(data[TIME_LS_KEY]);
			DELAY_AUTO_FILL_TIME = fillPayment;
			DELAY_CLICK_BUY_TIME = clickBuy;
		}
	});
}

function autoClickBinBtn() {
	setTimeout(() => {
		document.getElementById(BUY_IT_ID)?.click();
	}, DELAY_CLICK_BUY_TIME);
}

function autoClickPaymentMethod() {
	setTimeout(() => {
		document.querySelector(PAYMENT_OPTION_SELECTOR)?.click();
	}, 1000);
}

async function autoFillCardNumber() {
	$('.credit-card-number .float-label').addClass('expanded focused');
	const cardNumberElem = $('#cardNumber');
	const len = CARD_NUMBER.length;

	for (let i = 0; i < len; ++i) {
		const val = cardNumberElem.val();
		cardNumberElem.val(`${val}${CARD_NUMBER[i]}`);
		await sleep(DELAY_AUTO_FILL_TIME);
	}

	$('.credit-card-number .float-label').removeClass('focused');
}

async function autoFillCardExpiryDate() {
	$('.form-element:nth-child(1) .float-label').addClass('expanded focused');
	const cardExpiryDate = $('#cardExpiryDate');
	const len = EXPIRE_DATE.length;

	for (let i = 0; i < len; ++i) {
		const val = cardExpiryDate.val();
		cardExpiryDate.val(`${val}${EXPIRE_DATE[i]}`);
		await sleep(DELAY_AUTO_FILL_TIME);
	}

	$('.form-element:nth-child(1) .float-label').removeClass('focused');
}

async function autoFillCvvCode() {
	$('.form-element.card-cvv .float-label').addClass('expanded focused');
	const securityCode = $('#securityCode');
	const len = CVV_CODE.length;

	for (let i = 0; i < len; ++i) {
		const val = securityCode.val();
		securityCode.val(`${val}${CVV_CODE[i]}`);
		await sleep(DELAY_AUTO_FILL_TIME);
	}

	$('.form-element.card-cvv .float-label').removeClass('focused');
}

function getCardInfo() {
	chrome.storage.sync.get([CARD_INFO_LS_KEY], function (data) {
		const cardInfo = JSON.parse(data[CARD_INFO_LS_KEY] || null) || null;
		if (cardInfo) {
			const { cardNumber, expireDate, cvv } = cardInfo;
			CARD_NUMBER = cardNumber;
			EXPIRE_DATE = expireDate;
			CVV_CODE = cvv;
		}
	});
}

function isAuto() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get([AUTO_MODE_LS_KEY], function (data) {
			console.log(data[AUTO_MODE_LS_KEY]);
			if (data[AUTO_MODE_LS_KEY] === 'off') {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

// main flow
$(document).ready(async function () {
	const { hostname } = window.location;
	getTimeDelay();

	// buy now page
	if (hostname.indexOf('www.ebay.com') !== -1 && (await isAuto())) {
		// auto click buy it now button
		autoClickBinBtn();
	}

	// payment page
	if (hostname.indexOf('pay.ebay.com') !== -1 && (await isAuto())) {
		getCardInfo();

		// auto click payment method button
		autoClickPaymentMethod();

		// wait
		setTimeout(async () => {
			await autoFillCardNumber();
			await autoFillCardExpiryDate();
			await autoFillCvvCode();

			chrome.storage.sync.get([AUTO_DONE_LS_KEY], function (data) {
				if (data[AUTO_DONE_LS_KEY] === 'on') {
					document.querySelector('.form-action.ADD_CARD button').click();
				}
			});
		}, 5000);
	}
});
