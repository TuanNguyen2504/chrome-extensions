/// <reference path="D:\tips\typings-jq\globals\jquery\index.d.ts" />
const hlClass = 'tn-ex-hl-text';
const hlClassWrap = 'tn-ex-hl-text-wrap';

function getNodesThatContain(text) {
	var textNodes = $('body')
		.find(':not(iframe, script, style, meta, noscript)')
		.contents()
		.filter(function () {
			const regex = new RegExp(text, 'gi');
			return this.nodeType == 3 && regex.test(this.textContent);
		});
	return textNodes.parent();
}

function formatHighlight(paragraph, keyword) {
	let textResult = '';
	let count = 0;
	const splitArr = paragraph.split(' ');
	const keywordLen = keyword.length;
	let kw = keyword.toLowerCase();
	splitArr.forEach((word) => {
		const kwIndex = word.toLowerCase().indexOf(kw);
		if (kwIndex < 0) textResult += word + ' ';
		else {
			++count;
			if (word.length === keywordLen)
				textResult += `<span class="${hlClass}">${word}</span>`;
			else {
				textResult += `<span class="${hlClassWrap}">${word.substr(
					0,
					kwIndex,
				)}<span class="${hlClass}">${word.substr(
					kwIndex,
					keywordLen,
				)}</span>${word.substr(kwIndex + keywordLen)} </span>`;
			}
		}
	});
	return { textResult, nMatch: count };
}

function highlightAll(keyword) {
	if (keyword.trim() === '') {
		chrome.runtime.sendMessage({
			todo: 'countSearchMatch',
			value: 0,
		});
		return;
	}
	const docs = getNodesThatContain(keyword);
	let count = 0;
	docs.each(function (index) {
		const { textResult, nMatch } = formatHighlight($(this).text(), keyword);
		count += nMatch;
		$(this).empty();
		$(this).append(textResult);
	});

	chrome.runtime.sendMessage({
		todo: 'countSearchMatch',
		value: count,
	});
}

function unHighlightAll() {
	const docs = $(`.${hlClassWrap}`);
	docs.each(function (index) {
		const text = $(this).text();
		$(this).contents().empty();
		$(this).text(text);
		$(this).contents().unwrap();
	});
	$(`.${hlClass}`).contents().unwrap();
}

$(document).ready(() => {
	$('.wrap').contents().unwrap();

	// ev: chrome listener
	chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
		if (req.todo === 'searchInputChange') {
			unHighlightAll();
			highlightAll(req.value.trim());
		}
	});
});
