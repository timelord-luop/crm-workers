const API_BASE = import.meta.env.VITE_API_ROOT;
// const API_BASE = 'https://crm-workers-api.luopdjia.workers.dev/api';
const MethodType = {POST: 'post'}

export const ApiLogin= {
	URL: API_BASE + '/auth/login',
	METHOD: MethodType.POST,
	IS_AUTH: false,
	NO_MSG: true
};
