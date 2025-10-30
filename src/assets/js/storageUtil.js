const ArgsLocalStorage = {
	ACCESS_TOKEN: 'access_token',
	ACCESS_MNG_TOKEN: 'access_mng_token',
	ACCESS_KEY: 'access_key'
};

const TokenPrefix = '';

const TokenStorage = {
	saveAccessToken(accessToken) {
		LocalStorage.put(ArgsLocalStorage.ACCESS_TOKEN, TokenPrefix + accessToken)
	},

	saveAccessKey(key) {
		LocalStorage.put(ArgsLocalStorage.ACCESS_KEY, key);
	},

	getAccessToken() {
		return LocalStorage.get(ArgsLocalStorage.ACCESS_TOKEN) || '';
	},

	getAccessKey() {
		return LocalStorage.get(ArgsLocalStorage.ACCESS_KEY) || '';
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
	TokenStorage
}
