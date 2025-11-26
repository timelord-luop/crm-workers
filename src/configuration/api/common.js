const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

export const ApiLogin= {
	URL: API_BASE + '/auth/login',
	METHOD: MethodType.POST,
	IS_AUTH: false,
	NO_MSG: true
};

export const ApiLogout= {
	URL: API_BASE + '/users/logout',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
