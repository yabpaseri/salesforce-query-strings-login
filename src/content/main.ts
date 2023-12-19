import { LoginData } from '../types';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	sendResponse(true);
	const EXTENSION_ORIGIN = `chrome-extension://${chrome.runtime.id}`;
	if (EXTENSION_ORIGIN !== sender.origin) return;
	const data: LoginData = message;

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
	loginButton?.click();
});
