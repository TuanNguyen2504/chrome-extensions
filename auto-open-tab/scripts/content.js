/// <reference path="D:\tips\typings\jquery\globals\jquery\index.d.ts" />

const BUY_IT_ID = 'binBtn_btn';
const PAYMENT_OPTION_SELECTOR =
	'.payment-selection--details input.radio__control';

let CARD_NUMBER = '1111 1111 1111 1111';
let EXPIRE_DATE = '01/01';
let CVV_CODE = '111';
const CARD_INFO_LS_KEY = 'card-info';

const DELAY_AUTO_FILL_TIME = 250;

function sleep(time = DELAY_AUTO_FILL_TIME) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, time);
	});
}

function autoClickBinBtn() {
	console.log('click');
	setTimeout(() => {
		document.getElementById(BUY_IT_ID)?.click();
	}, 1000);
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

// main flow
$(document).ready(function () {
	const { hostname } = window.location;

	// buy now page
	if (hostname.indexOf('www.ebay.com') !== -1) {
		// auto click buy it now button
		autoClickBinBtn();
	}

	// payment page
	if (hostname.indexOf('pay.ebay.com') !== -1) {
		getCardInfo();

		// auto click payment method button
		autoClickPaymentMethod();

		// wait
		setTimeout(async () => {
			await autoFillCardNumber();
			await autoFillCardExpiryDate();
			await autoFillCvvCode();

			document.querySelector('.form-action.ADD_CARD button').click();
		}, 5000);
	}
});
