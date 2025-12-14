const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

// 客户自定义字段列表
export const ApiClientCustomFiledList = {URL: API_BASE + '/client/clientCustomFiled', METHOD: MethodType.POST, IS_AUTH: true};
// 新增客户自定义字段
export const ApiClientCustomFiledAdd = {URL: API_BASE + '/client/clientCustomFiled/add', METHOD: MethodType.POST, IS_AUTH: true};
// 编辑客户自定义字段
export const ApiClientCustomFiledUpdate = {URL: API_BASE + '/client/clientCustomFiled/edit', METHOD: MethodType.POST, IS_AUTH: true};
// 删除客户自定义字段
export const ApiClientCustomFiledDelete = {URL: API_BASE + '/client/clientCustomFiled/delete', METHOD: MethodType.POST, IS_AUTH: true};
// 客户自定义字段排序
export const ApiClientCustomFiledSort = {URL: API_BASE + '/client/clientCustomFiled/sort', METHOD: MethodType.POST, IS_AUTH: true};
// 客户自定义字段修改状态
export const ApiClientCustomFiledStatus = {URL: API_BASE + '/client/clientCustomFiled/status', METHOD: MethodType.POST, IS_AUTH: true};
