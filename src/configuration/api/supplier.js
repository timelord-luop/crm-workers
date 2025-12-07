const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

// 供应商列表
export const ApiSupplierQueryList = {
	URL: API_BASE + '/supplier/queryList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 供应商详情
export const ApiSupplierInfo = {
	URL: API_BASE + '/supplier/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 供应商新增
export const ApiSupplierAdd = {
	URL: API_BASE + '/supplier/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 供应商编辑
export const ApiSupplierUpdate = {
	URL: API_BASE + '/supplier/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 供应商删除
export const ApiSupplierDelete = {
	URL: API_BASE + '/supplier/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
