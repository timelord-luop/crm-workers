const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

export const ApiLogin= {
	URL: API_BASE + '/auth/login',
	METHOD: MethodType.POST,
	IS_AUTH: false,
	NO_MSG: true
};
// 全部字典
export const ApiSysDictionaryALl = {
	URL: API_BASE + '/sys/dictionary',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 单个字典
export const ApiSysDictionaryRow = {
	URL: API_BASE + '/sys/dictionary/row',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 单个字典批量排序
export const ApiSysDictionarySort = {
	URL: API_BASE + '/sys/dictionary/sort',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 查询多个字典 传入 dictKey: ['BANK']
export const ApiSysDictionaryRows = {
	URL: API_BASE + '/sys/dictionary/rows',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 添加单个字典
export const ApiSysDictionaryAdd = {
	URL: API_BASE + '/sys/dictionary/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 更新单个字典
export const ApiSysDictionaryUpdate = {
	URL: API_BASE + '/sys/dictionary/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 删除单个字典
export const ApiSysDictionaryDelete = {
	URL: API_BASE + '/sys/dictionary/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
