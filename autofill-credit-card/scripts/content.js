let CARD_NUMBER = '1111111111111111';
let EXPIRE_DATE = '01/01';
let CVV_CODE = '111';
const CARD_INFO_LS_KEY = 'card-info';

let DELAY_AUTO_FILL_TIME = 200;

function sleep(time = DELAY_AUTO_FILL_TIME) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, time);
	});
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

function fastFill() {
	$('.credit-card-number .float-label').addClass('expanded focused');
	$('#cardNumber').val(CARD_NUMBER);
	$('.credit-card-number .float-label').removeClass('focused');

	$('.form-element:nth-child(1) .float-label').addClass('expanded focused');
	$('#cardExpiryDate').val(EXPIRE_DATE);
	$('.form-element:nth-child(1) .float-label').removeClass('focused');

	$('.form-element.card-cvv .float-label').addClass('expanded focused');
	$('#securityCode').val(CVV_CODE);
	$('.form-element.card-cvv .float-label').removeClass('focused');
}

// main flow
$(document).ready(async function () {
	getCardInfo();

	// auto fill card
	chrome.runtime.onMessage.addListener(function (request) {
		if (request.msg === 'fill-card') {
			setTimeout(async () => {
				await autoFillCardNumber();
				await autoFillCardExpiryDate();
				await autoFillCvvCode();
			}, 1000);
		} else if (request.msg === 'fast-fill-card') {
			fastFill();
		}
	});
});
