const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

export const ApiSysConfig= {
	URL: API_BASE + '/sys-config',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
