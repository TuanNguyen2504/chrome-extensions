/// <reference path="D:\tips\typings-jq\globals\jquery\index.d.ts" />

$(document).ready(() => {
	// ev: search input change
	$('#searchInput').change(function () {
		const value = $(this).val();
		chrome.tabs.query({ active: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { todo: 'searchInputChange', value });
		});
	});

	// ev: color picker change
	$('#colorPicker').change(function () {
		const value = $(this).val();
		console.log(value);
	});

	// ev: transparent slider change
	$('#transparent').change(function () {
		const value = $(this).val();
		$('#transparentVal').text(`${value}%`);
	});

	// ev: font size slider change
	$('#size').change(function () {
		const value = $(this).val();
		$('#sizeVal').text(`${value}px`);
	});

	// ev: chrome listener
	chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
		if (req.todo === 'countSearchMatch') {
			$('#searchResult').text(`${req.value ? 1 : 0}/${req.value}`);
		}
	});
});
