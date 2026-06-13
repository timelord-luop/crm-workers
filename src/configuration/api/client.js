const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = { POST: 'post' };

// 客户字段/自定义字段
export const ApiClientCustomFiledList = { URL: API_BASE + '/client/clientCustomFiled', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientFiledList = { URL: API_BASE + '/client/clientFiled', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientCustomFiledAdd = { URL: API_BASE + '/client/clientCustomFiled/add', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientCustomFiledUpdate = { URL: API_BASE + '/client/clientCustomFiled/edit', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientCustomFiledSetHead = { URL: API_BASE + '/client/clientCustomFiled/setHead', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientCustomFiledDelete = { URL: API_BASE + '/client/clientCustomFiled/delete', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientCustomFiledSort = { URL: API_BASE + '/client/clientCustomFiled/sort', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientCustomFiledStatus = { URL: API_BASE + '/client/clientCustomFiled/status', METHOD: MethodType.POST, IS_AUTH: true };

// 客户
export const ApiClientQueryList = { URL: API_BASE + '/client/queryList', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientAdd = { URL: API_BASE + '/client/add', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientUpdate = { URL: API_BASE + '/client/edit', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientDelete = { URL: API_BASE + '/client/delete', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientInfo = { URL: API_BASE + '/client/info', METHOD: MethodType.POST, IS_AUTH: true };

// 客户跟进
export const ApiClientFollowList = { URL: API_BASE + '/follow/list', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientFollowAdd = { URL: API_BASE + '/follow/add', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientFollowLatest = { URL: API_BASE + '/follow/latest', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientFollowLatestEdit = { URL: API_BASE + '/follow/latest/edit', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiOperationLogList = { URL: API_BASE + '/opLog/list', METHOD: MethodType.POST, IS_AUTH: true };

// 导入导出
export const ApiClientExport = { URL: API_BASE + '/client/export', METHOD: MethodType.POST, IS_AUTH: true };
export const ApiClientImport = { URL: API_BASE + '/client/import', METHOD: MethodType.POST, IS_AUTH: true };
