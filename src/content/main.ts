import { LoginData } from '../types';

const print = console.log.bind(console, '%c SALESFORCE_QUERY_STRINGS_LOGIN %c', 'background-color:#92D1EA;', '');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	// 送られたその瞬間、service_workerは役目を終えるので、ここで返してOK
	sendResponse(true);
	print('Received message from service-worker.');
	const EXTENSION_ORIGIN = new URL(chrome.runtime.getURL('')).origin;
	if (EXTENSION_ORIGIN !== sender.origin) return;
	const data: LoginData = message;
	print(`LoginData = ${JSON.stringify({ ...data, pw: '*'.repeat(data.pw.length) })}`);

	const useNewIdentity = document.getElementById('use_new_identity');
	if (useNewIdentity && useNewIdentity.checkVisibility()) {
		// 他のユーザを表示が出ている場合は、押す
		useNewIdentity.click();
	}
	const unInput = document.getElementById('username') as HTMLInputElement | null;
	const pwInput = document.getElementById('password') as HTMLInputElement | null;
	const loginButton = document.getElementById('Login');
	if (!(unInput && pwInput)) return; // 入力欄が無いページは対象外

	unInput.value = data.un;
	pwInput.value = data.pw;
	if (loginButton) {
		loginButton.click();
	} else {
		print('Login button not found.');
	}
});
