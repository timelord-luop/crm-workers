const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'};

// 日记账列表
export const ApiDayBookQueryList = {
	URL: API_BASE + '/dayBook/queryList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 日记账导出
export const ApiDayBookExport = {
	URL: API_BASE + '/dayBook/export',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 日记账新增
export const ApiDayBookAdd = {
	URL: API_BASE + '/dayBook/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 日记账编辑
export const ApiDayBookUpdate = {
	URL: API_BASE + '/dayBook/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 日记账删除
export const ApiDayBookDelete = {
	URL: API_BASE + '/dayBook/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
