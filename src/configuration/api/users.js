const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

export const ApiSysConfig= {
	URL: API_BASE + '/sys-config',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 退出登录
export const ApiLogout= {
	URL: API_BASE + '/users/logout',
	METHOD: MethodType.POST,
	IS_AUTH: true
};
// 职位分页列表
export const ApiPostList = {
	URL: API_BASE + '/users/post/list',
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
