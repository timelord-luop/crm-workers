const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

// 退出登录
export const ApiLogout= {
	URL: API_BASE + '/users/logout',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 职位分页列表
export const ApiPostQueryList = {
	URL: API_BASE + '/users/post/queryList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 职位simple列表
export const ApiPostSimpleList = {
	URL: API_BASE + '/users/post/simpleList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 新增职位
export const ApiPostAdd = {
	URL: API_BASE + '/users/post/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 编辑职位
export const ApiPostUpdate = {
	URL: API_BASE + '/users/post/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 删除职位
export const ApiPostDelete = {
	URL: API_BASE + '/users/post/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 部门列表
export const ApiDeptList = {
	URL: API_BASE + '/users/dept/list',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 职位simple列表
export const ApiDeptSimpleList = {
	URL: API_BASE + '/users/dept/simpleList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 新增部门
export const ApiDeptAdd = {
	URL: API_BASE + '/users/dept/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 编辑部门
export const ApiDeptUpdate = {
	URL: API_BASE + '/users/dept/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 删除部门
export const ApiDeptDelete = {
	URL: API_BASE + '/users/dept/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 员工列表
export const ApiUserList = {
	URL: API_BASE + '/users/list',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 员工simple列表
export const ApiUserSimpleList = {
	URL: API_BASE + '/users/simpleList',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 新增员工
export const ApiUserAdd = {
	URL: API_BASE + '/users/add',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 员工详情
export const ApiUserInfo = {
	URL: API_BASE + '/users/info',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 编辑员工
export const ApiUserUpdate = {
	URL: API_BASE + '/users/edit',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 删除员工
export const ApiUserDelete = {
	URL: API_BASE + '/users/delete',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 重置员工密码
export const ApiUserResetPwd = {
	URL: API_BASE + '/users/resetPwd',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 停用账号
export const ApiUserDisableAccount = {
	URL: API_BASE + '/users/disableAccount',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 启用账号
export const ApiUserEnableAccount = {
	URL: API_BASE + '/users/enableAccount',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 离职办理
export const ApiUserDimission = {
	URL: API_BASE + '/users/dimission',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

// 复职
export const ApiUserReinstate = {
	URL: API_BASE + '/users/reinstate',
	METHOD: MethodType.POST,
	IS_AUTH: true
};

