import { LoginData } from '../types';

const SALESFORCE_URL_REGEXP_PATTERN = '^https://.+\\.salesforce\\.com/.*$';
const SALESFORCE_URLS = ['https://*.salesforce.com/*'];

// タブへの送信待ちデータ
const sendQueue = new Map<number, LoginData>();
// リクエスト完了待ちのデータ
const requestedMap = new Map<string, LoginData>();

// LoginDataのpwをマスクした文字列で返却する
const dataToMaskedStr = (data: LoginData) => JSON.stringify({ ...data, pw: '*'.repeat(data.pw.length) });

// ナビゲーションの開始時に呼び出される
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
	// メインのフレームの更新では無ければスルー
	if (!(details.frameId === 0 && details.parentFrameId === -1 && details.frameType === 'outermost_frame')) return;
	// タブに未送信の情報を削除する
	if (sendQueue.delete(details.tabId)) {
		console.log('[webNavigation.onBeforeNavigate]', `Deleted from sendQueue(${details.tabId})`);
	}
});

// リクエストの発生時に呼び出される
chrome.webRequest.onBeforeRequest.addListener(
	(details) => {
		// メインのフレーム以外はスルー
		if (details.frameId !== 0 || details.parentFrameId !== -1 || details.tabId < 0) return;
		const url = new URL(details.url);
		const un = url.searchParams.get('un');
		const pw = url.searchParams.get('pw');
		if (!un || !pw) return;
		const requestId = details.requestId;
		const data = { un, pw };
		requestedMap.set(requestId, data);
		console.log('[webRequest.onBeforeRequest]', `Added to requestedMap(${requestId}): ${dataToMaskedStr(data)}`);
	},
	{ urls: SALESFORCE_URLS },
);

// リクエストが完了すると呼び出される
chrome.webRequest.onCompleted.addListener(
	(details) => {
		// リクエスト発生時のデータを確認し、存在しなければ作業無し
		const requestId = details.requestId;
		const data = requestedMap.get(requestId);
		if (data == null) return;
		// sendQueueにデータを移して、DOMへの送信待機
		sendQueue.set(details.tabId, data);
		requestedMap.delete(requestId);
		console.log('[webRequest.onCompleted]', `Move to sendQueue(${details.tabId}) from requested(${requestId}): ${dataToMaskedStr(data)}`);
	},
	{ urls: SALESFORCE_URLS },
);

// ドキュメント（参照するリソースを含む）が完全に読み込まれ、初期化されたときに呼び出される
chrome.webNavigation.onCompleted.addListener(
	(details) => {
		// メインのフレームの更新では無ければスルー
		if (!(details.frameId === 0 && details.frameType === 'outermost_frame')) return;
		const tabId = details.tabId;
		const data = sendQueue.get(tabId);
		if (data != null) {
			sendQueue.delete(tabId);
			chrome.tabs.sendMessage(tabId, data, (res) => {
				if (res) {
					console.log('[webNavigation.onCompleted]', `Send data to content_script(tabId=${tabId}): ${dataToMaskedStr(data)}`);
				}
			});
		}
	},
	{ url: [{ urlMatches: SALESFORCE_URL_REGEXP_PATTERN }] },
);
