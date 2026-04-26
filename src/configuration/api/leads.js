const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

// 线索列表（分页）
export const ApiLeadsQueryList = {
	URL: API_BASE + '/leads/queryList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 线索详情
export const ApiLeadsInfo = {
	URL: API_BASE + '/leads/info',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 新增线索
export const ApiLeadsAdd = {
	URL: API_BASE + '/leads/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 编辑线索
export const ApiLeadsUpdate = {
	URL: API_BASE + '/leads/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 删除线索
export const ApiLeadsDelete = {
	URL: API_BASE + '/leads/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 修改线索状态
export const ApiLeadsUpdateStatus = {
	URL: API_BASE + '/leads/updateStatus',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 分配负责人
export const ApiLeadsAssignOwner = {
	URL: API_BASE + '/leads/assignOwner',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 设置下次联系时间
export const ApiLeadsSetNextContact = {
	URL: API_BASE + '/leads/setNextContact',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 导出线索
export const ApiLeadsExport = {
	URL: API_BASE + '/leads/export',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 线索转商机
export const ApiLeadsConvert = {
	URL: API_BASE + '/leads/convert',
	METHOD: MethodType.POST,
	IS_AUTH: true
};