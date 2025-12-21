import {ApiSupplierQueryList} from "@/configuration/api/supplier.js";

const API_BASE = import.meta.env.VITE_API_ROOT;
const MethodType = {POST: 'post'}

// 客户自定义字段列表
export const ApiClientCustomFiledList = {URL: API_BASE + '/client/clientCustomFiled', METHOD: MethodType.POST, IS_AUTH: true};
export const ApiClientFiledList = {URL: API_BASE + '/client/clientFiled', METHOD: MethodType.POST, IS_AUTH: true};
// 新增客户自定义字段
export const ApiClientCustomFiledAdd = {URL: API_BASE + '/client/clientCustomFiled/add', METHOD: MethodType.POST, IS_AUTH: true};
// 编辑客户自定义字段
export const ApiClientCustomFiledUpdate = {URL: API_BASE + '/client/clientCustomFiled/edit', METHOD: MethodType.POST, IS_AUTH: true};
// 客户自定义字段设置表头
export const ApiClientCustomFiledSetHead = {URL: API_BASE + '/client/clientCustomFiled/setHead', METHOD: MethodType.POST, IS_AUTH: true};
// 删除客户自定义字段
export const ApiClientCustomFiledDelete = {URL: API_BASE + '/client/clientCustomFiled/delete', METHOD: MethodType.POST, IS_AUTH: true};
// 客户自定义字段排序
export const ApiClientCustomFiledSort = {URL: API_BASE + '/client/clientCustomFiled/sort', METHOD: MethodType.POST, IS_AUTH: true};
// 客户自定义字段修改状态
export const ApiClientCustomFiledStatus = {URL: API_BASE + '/client/clientCustomFiled/status', METHOD: MethodType.POST, IS_AUTH: true};
// 客户分页列表
export const ApiClientQueryList = {URL: API_BASE + '/client/queryList', METHOD: MethodType.POST, IS_AUTH: true};
// 客户新增
export const ApiClientAdd = {URL: API_BASE + '/client/add', METHOD: MethodType.POST, IS_AUTH: true};
// 客户编辑
export const ApiClientUpdate = {URL: API_BASE + '/client/edit', METHOD: MethodType.POST, IS_AUTH: true};
// 客户删除
export const ApiClientDelete = {URL: API_BASE + '/client/delete', METHOD: MethodType.POST, IS_AUTH: true};
// 客户详情
export const ApiClientInfo = {URL: API_BASE + '/client/info', METHOD: MethodType.POST, IS_AUTH: true};
