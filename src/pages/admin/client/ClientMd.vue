<script setup>
import {onMounted, reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {QuestionFilled} from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";

import CommonUtil from "@/assets/js/commonUtil.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";
import BankList from "@/components/BankList.vue";
import {ApiDeptList} from "@/configuration/api/users.js";
import {ApiClientAdd, ApiClientCustomFiledList, ApiClientInfo, ApiClientUpdate} from "@/configuration/api/client.js";

const router = useRouter()
const route = useRoute()
const loading = ref(false);
const title = ref('');
const committing = ref(false);
const userOptions = ref([]);
const typeOptions = ref([]);
const sourceOptions = ref([]);
const industryOptions = ref([]);
const areaOptions = ref([]);
const formRef = ref();
const areaRef = ref();
const formData = reactive({
	name: '',
	code: '',
	type: '',
	principal: '',
	serviceUsers: [],
	areaCode: [],
	areaText: '',
	address: '',
	remark: '',
	source: '',
	industry: '',
	bankCards: [],
	contactName: '',
	contactPhone: '',
	contactExtend: '',
	contactEmail: '',
	contactRemark: '',
	invoiceTitle: '',
	invoiceTelephone: '',
	invoiceAddress: '',
	invoiceITIN: '',
	customFields: []
})
const rules = {
	name: [{required: true, message: '请输入客户名称', trigger: 'change'}],
	type: [{required: true, message: '请选择客户类型', trigger: 'change'}],
	principal: [{required: true, message: '请选择客户负责人', trigger: 'change'}]
}
/* ================= formatter：只管显示 ================= */
const format = (value) => {
	if (!value) return ''
	const [intPart, decimalPart] = value.split('.')
	const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return decimalPart !== undefined
		? `￥${formattedInt}.${decimalPart}`
		: `￥${formattedInt}`
}
/* ================= parser：只管“输入合法性” ================= */
const parse = (value) => {
	if (!value) return ''
	// 去除 ￥ 和 ,
	value = value.replace(/[￥,]/g, '')
	// 只保留数字和 .
	value = value.replace(/[^\d.]/g, '')
	// 只允许一个小数点
	const dotIndex = value.indexOf('.')
	if (dotIndex !== -1) {
		value =
			value.slice(0, dotIndex + 1) +
			value.slice(dotIndex + 1).replace(/\./g, '')
	}
	if (value.startsWith('.')) {
		value = '0' + value
	}
	return value
}

onMounted( async () => {
	await getFieldData();
	getDictList();
	getUserList();
	areaOptions.value = await CommonUtil.getAreaOptions();
	if (route.query.eid) {
		title.value = '编辑客户';
		getBaseData();
	} else {
		title.value = '新增客户';
	}
})
const getFieldData = async () => {
	loading.value = true;
	await Http.request(ApiClientCustomFiledList).then(res => {
		let customFields = [];
		res.list.forEach((item, index) => {
			let obj = {
				...item,
				value: null,
				optionsText: item.options.map(opt => opt.val).join('，')
			}
			if (item.fieldType === 2) {
				let defaultOpt = item.options.filter(opt => opt.isDefault === true);
				if (defaultOpt.length) {
					if (item.multiple === 1) {
						obj.value = defaultOpt[0].val;
					}
					if (item.multiple === 2) {
						obj.value = defaultOpt.map(opt => opt.val);
					}
				}
			}
			customFields.push(obj);
			if (item.isRequired === 1) {
				rules[`customFields[${index}].value`] = [{required: true, message: `请${item.fieldType === 1 ? '输入' : '选择'}${item.name}`, trigger: 'change'}]
			}
		})
		formData.customFields = customFields;
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
const getDictList = () => {
	const params = {
		dictKey: ['CLIENT_TYPE', 'CLIENT_SOURCE', 'CLIENT_INDUSTRY']
	};
	Http.request(ApiSysDictionaryRows, params).then(res => {
		typeOptions.value = res.list.filter(item => item.dictKey === 'CLIENT_TYPE');
		sourceOptions.value = res.list.filter(item => item.dictKey === 'CLIENT_SOURCE');
		industryOptions.value = res.list.filter(item => item.dictKey === 'CLIENT_INDUSTRY');
	})
}
const getUserList = () => {
	Http.request(ApiDeptList, {type: 'list'}).then(res => {
		userOptions.value = CommonUtil.arrayToChartTree(res.list);
	}).catch(err => {
		console.log(err);
	})
}
const getBaseData = () => {
	loading.value = true;
	Http.request(ApiClientInfo, {id: route.query.eid}).then(res => {
		loading.value = false;
		if (res.data) {
			parseFormData(res.data)
		}
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
const parseFormData = (data) => {
	formData.id = data.id;
	formData.name = data.name;
	formData.code = data.code;
	formData.type = data.type;
	formData.principal = data.principal;
	formData.serviceUsers = data.serviceUsers ? data.serviceUsers.split(',') : [];
	formData.areaCode = data.areaCode ? JSON.parse(data.areaCode) : [];
	formData.areaText = data.areaText;
	formData.address = data.address;
	formData.remark = data.remark;
	formData.source = data.source;
	formData.industry = data.industry;
	formData.bankCards = data.bankCards ? JSON.parse(data.bankCards) : [];
	formData.contactName = data.contactName;
	formData.contactPhone = data.contactPhone;
	formData.contactExtend = data.contactExtend;
	formData.contactEmail = data.contactEmail;
	formData.contactRemark = data.contactRemark;
	formData.invoiceTitle = data.invoiceTitle;
	formData.invoiceTelephone = data.invoiceTelephone;
	formData.invoiceAddress = data.invoiceAddress;
	formData.invoiceITIN = data.invoiceITIN;
	if (data.customFields) {
		const fieldObj = JSON.parse(data.customFields);
		formData.customFields.forEach(item => {
			if (fieldObj[item.key]) {
				item.value = fieldObj[item.key]
			}
		})
	}
}
const areaHandleChange = (value) => {
	console.log(value, 'value')
	if (value && value.length > 0) {
		// 需要等待DOM更新后获取
		setTimeout(() => {
			if (areaRef.value) {
				formData.areaText = areaRef.value.presentText;
			}
		}, 0);
	}
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return CommonUtil.scrollToFirstError();
		let params = getSubmitData();
		committing.value = true;
		const API = params.id ? ApiClientUpdate : ApiClientAdd;
		Http.request(API, params).then(res => {
			committing.value = false;
			router.push({
				path: '/client-list',
				query: {
					_t: Date.now()
				}
			})
		}).catch(err => {
			console.log(err);
			committing.value = false;
		})
	})
}
const getSubmitData = () => {
	let data = CommonUtil.deepClone(formData);
	data.bankCards = JSON.stringify(data.bankCards);
	let customFields = {};
	if (data.customFields.length) {
		data.customFields.forEach(item => {
			customFields[item.key] = item.value;
		})
		data.customFields = JSON.stringify(customFields)
	}
	if (data.serviceUsers.length) {
		data.serviceUsers = data.serviceUsers.join()
	}
	return data;
}
</script>

<template lang="pug">
	.info-container(v-loading="loading")
		.info-header
			._title {{title}}
			._btn
				el-button(plain @click="router.go(-1)") 取 消
				el-button(type="primary" :loading="committing" @click="toCommit(formRef)") 保 存
		.info-body
			el-form(
				ref="formRef"
				:model="formData"
				:rules="rules"
				label-position="top"
				@submit.prevent
				label-width="auto"
			)
				.info-block
					._title 基础信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="客户名称" prop="name")
								el-input(v-model="formData.name" placeholder="请输入" maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="客户编号")
								el-input(v-model="formData.code" placeholder="请输入" clearable maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(prop="type")
								template(#label)
									span
										span 客户类型
										el-popover(placement="top-start" content="“系统设置-数据字典” 维护" :show-after="300" width="200")
											template(#reference)
												el-icon._label-icon
													QuestionFilled
								el-select(v-model="formData.type" placeholder="请选择" clearable)
									el-option(v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item
								template(#label)
									span
										span 客户来源
										el-popover(placement="top-start" content="“系统设置-数据字典” 维护" :show-after="300" width="200")
											template(#reference)
												el-icon._label-icon
													QuestionFilled
								el-select(v-model="formData.source" placeholder="请选择" clearable)
									el-option(v-for="item in sourceOptions" :key="item.id" :label="item.name" :value="item.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item
								template(#label)
									span
										span 客户行业
										el-popover(placement="top-start" content="“系统设置-数据字典” 维护" :show-after="300" width="200")
											template(#reference)
												el-icon._label-icon
													QuestionFilled
								el-select(v-model="formData.industry" placeholder="请选择" clearable)
									el-option(v-for="item in industryOptions" :key="item.id" :label="item.name" :value="item.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="客户负责人" prop="principal")
								el-cascader(v-model="formData.principal"
									style="width: 100%"
									:options="userOptions"
									:props="{label: 'name', value: 'id', emitPath: false}",
									filterable)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="客服专员")
								el-cascader(v-model="formData.serviceUsers"
									style="width: 100%"
									:options="userOptions"
									:show-all-levels="false"
									:props="{label: 'name', value: 'id', emitPath: false, multiple: true}",
									clearable,
									filterable)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="所在地区")
								el-cascader(v-model="formData.areaCode"
									ref="areaRef"
									style="width: 100%"
									:options="areaOptions"
									:props="{showPrefix: false, checkStrictly: true, checkOnClickNode: true, emitPath: true}",
									@change="areaHandleChange"
									filterable,
									clearable)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="详细地址")
								el-input(v-model="formData.address" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="其他备注")
								el-input(v-model="formData.remark" type="textarea" maxlength="255" :rows="1" placeholder="请输入")
				.info-block(v-if="formData.customFields.length")
					._title 其他信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6" v-for="(item,index) in formData.customFields" :key="item.id")
							el-form-item(:label="item.name" :prop="`customFields[${index}].value`")
								el-input(
									v-if="item.fieldType === 1 && item.textType === 1"
									v-model="item.value"
									:placeholder="item.placeholder || '请输入'"
									maxlength="256"
									)
									template(#suffix, v-if="item.unit") {{item.unit}}
								el-input(
									v-if="item.fieldType === 1 && item.textType === 2"
									type="textarea"
									autosize
									v-model="item.value"
									:placeholder="item.placeholder || '请输入'"
									maxlength="1024")
								el-input-number(
									style="width: 100%"
									v-if="item.fieldType === 1 && item.textType === 3"
									:max="9999999999"
									:placeholder="item.placeholder || '请输入'"
									:value-on-clear="null"
									disabled-scientific,
									align="left"
									:controls="false"
									v-model="item.value"
									)
									template(#suffix, v-if="item.unit") {{item.unit}}
								el-input(
									v-if="item.fieldType === 1 && item.textType === 4"
									v-model="item.value"
									:placeholder="item.placeholder || '请输入'"
									:formatter="format"
									:parser="parse"
									maxlength="20"
								)
								el-select(
									v-if="item.fieldType === 2"
									v-model="item.value"
									:placeholder="item.placeholder || '请选择'"
									:multiple="item.multiple === 2"
								)
									el-option(v-for="opt in item.options" :key="opt.val" :label="opt.val" :value="opt.val")
				.info-block
					._title 联系人信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="联系人姓名")
								el-input(v-model="formData.contactName" placeholder="请输入" maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="联系人手机号")
								el-input(v-model="formData.contactPhone" placeholder="请输入" clearable maxlength="11")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="备用联系方式")
								el-input(v-model="formData.contactExtend" placeholder="请输入" clearable maxlength="32")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="联系邮箱")
								el-input(v-model="formData.contactEmail" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="备注")
								el-input(v-model="formData.contactRemark" type="textarea" maxlength="255" :rows="1" placeholder="请输入" )
				.info-block
					._title 财务信息
					bank-list(v-model="formData.bankCards")
				.info-block
					._title 开票信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="发票抬头")
								el-input(v-model="formData.invoiceTitle" placeholder="请输入" maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="单位电话")
								el-input(v-model="formData.invoiceTelephone" placeholder="请输入" clearable maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="地址")
								el-input(v-model="formData.invoiceAddress" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="纳税人识别号")
								el-input(v-model="formData.invoiceITIN" placeholder="请输入" clearable maxlength="64")
</template>

<style scoped lang="scss">

</style>
