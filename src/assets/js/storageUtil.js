const ArgsLocalStorage = {
	ACCESS_TOKEN: 'access_token',
	AREA_CODE_LIST: 'area_code_list'
};

const TokenStorage = {
	saveAccessToken(accessToken) {
		LocalStorage.put(ArgsLocalStorage.ACCESS_TOKEN, accessToken)
	},
	getAccessToken() {
		return LocalStorage.get(ArgsLocalStorage.ACCESS_TOKEN) || '';
	},
	clearToken() {
		LocalStorage.remove(ArgsLocalStorage.ACCESS_TOKEN);
	}
}

const LocalStorage = {
	get(key) {
		try {
			return JSON.parse(window.localStorage.getItem(key));
		} catch (err) {
			return null;
		}
	},
	put(key, value) {
		window.localStorage.setItem(key, JSON.stringify(value));
	},
	remove(key) {
		window.localStorage.removeItem(key);
	},
	clear() {
		window.localStorage.clear();
	}
}

export {
	TokenStorage,
	LocalStorage
}
