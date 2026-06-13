const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = { POST: 'post' };

export const ApiReceiptOptions = {
	URL: API_BASE + '/receipt/options',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiReceiptQueryList = {
	URL: API_BASE + '/receipt/queryList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiReceiptInfo = {
	URL: API_BASE + '/receipt/info',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiReceiptAdd = {
	URL: API_BASE + '/receipt/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiReceiptUpdate = {
	URL: API_BASE + '/receipt/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiReceiptDelete = {
	URL: API_BASE + '/receipt/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiReceiptExport = {
	URL: API_BASE + '/receipt/export',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

export const ApiPaymentOptions = {
	URL: API_BASE + '/payment/options',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiPaymentQueryList = {
	URL: API_BASE + '/payment/queryList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiPaymentInfo = {
	URL: API_BASE + '/payment/info',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiPaymentAdd = {
	URL: API_BASE + '/payment/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiPaymentUpdate = {
	URL: API_BASE + '/payment/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiPaymentDelete = {
	URL: API_BASE + '/payment/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiPaymentExport = {
	URL: API_BASE + '/payment/export',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

