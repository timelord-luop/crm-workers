const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'};

// 商机列表
export const ApiOpportunityQueryList = {
	URL: API_BASE + '/opportunity/queryList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 商机详情
export const ApiOpportunityInfo = {
	URL: API_BASE + '/opportunity/info',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 新增商机
export const ApiOpportunityAdd = {
	URL: API_BASE + '/opportunity/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 编辑商机
export const ApiOpportunityUpdate = {
	URL: API_BASE + '/opportunity/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 删除商机
export const ApiOpportunityDelete = {
	URL: API_BASE + '/opportunity/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 修改商机阶段
export const ApiOpportunityUpdateStage = {
	URL: API_BASE + '/opportunity/updateStage',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 导出商机
export const ApiOpportunityExport = {
	URL: API_BASE + '/opportunity/export',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

export const ApiOpportunityFollowList = {
	URL: API_BASE + '/follow/list',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiOpportunityFollowAdd = {
	URL: API_BASE + '/follow/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiOpportunityFollowLatest = {
	URL: API_BASE + '/follow/latest',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
export const ApiOpportunityFollowLatestEdit = {
	URL: API_BASE + '/follow/latest/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
