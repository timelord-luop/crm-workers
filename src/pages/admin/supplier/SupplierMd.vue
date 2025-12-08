<script setup>
import {ref, reactive, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { QuestionFilled } from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";

import BankDialog from "@/components/BankDialog.vue";
import CommonUtil from "@/assets/js/commonUtil.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";
import {ApiSupplierAdd, ApiSupplierInfo, ApiSupplierUpdate} from "@/configuration/api/supplier.js";
import BankList from "@/components/BankList.vue";

const router = useRouter()
const route = useRoute()
const loading = ref(false);
const title = ref('');
const committing = ref(false);
const classifyList = ref([]);
const levelList = ref([]);
const areaOptions = ref([]);
const formRef = ref();
const areaRef = ref();
const formData = ref({
	name: '',
	code: '',
    isClient: 0,
    classify: '',
    level: '',
    invoiceType: '',
	areaCode: [],
	areaText: '',
	address: '',
	remark: '',
    bankCards: [],
	contactName: '',
	contactPhone: '',
	contactExtend: '',
	contactEmail: '',
	contactRemark: ''
})
const rules = reactive({
	name: [{required: true, message: '请输入供应商名称', trigger: 'change'}],
	isClient: [{required: true, message: '请选择是否为客户', trigger: 'change'}],
	classify: [{required: true, message: '请选择供应商类别', trigger: 'change'}],
	invoiceType: [{required: true, message: '请选择开票类型', trigger: 'change'}]
})

onMounted( async () => {
	getDictList();
	areaOptions.value = await CommonUtil.getAreaOptions();
	if (route.query.eid) {
		title.value = '编辑供应商';
		getBaseData();
	} else {
		title.value = '新增供应商';
	}
})
const getBaseData = () => {
	loading.value = true;
	Http.request(ApiSupplierInfo, {id: route.query.eid}).then(res => {
		loading.value = false;
		if (res.data) {
			formData.value = res.data;
		}
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}

const getDictList = () => {
	const params = {
		dictKey: ['SUPPLIER_CLASSIFY', 'SUPPLIER_LEVEL']
	};
	Http.request(ApiSysDictionaryRows, params).then(res => {
		classifyList.value = res.list.filter(item => item.dictKey === 'SUPPLIER_CLASSIFY');
		levelList.value = res.list.filter(item => item.dictKey === 'SUPPLIER_LEVEL');
	})
}
const areaHandleChange = (value) => {
	console.log(value, 'value')
	if (value && value.length > 0) {
		// 需要等待DOM更新后获取
		setTimeout(() => {
			if (areaRef.value) {
				const presentText = areaRef.value.presentText;
				formData.value.areaText = presentText;
				console.log('选中文本:', presentText);
			}
		}, 0);
	}
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return CommonUtil.scrollToFirstError();
		let params = getSubmitData();
		console.log(params, 'params')
		committing.value = true;
		const API = params.id ? ApiSupplierUpdate : ApiSupplierAdd;
		Http.request(API, params).then(res => {
			committing.value = false;
			router.push({
				path: '/supplier',
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
	let submitData = CommonUtil.deepClone(formData.value);
	submitData.bankCards = JSON.stringify(submitData.bankCards)
	return submitData;
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
							el-form-item(label="供应商名称" prop="name")
								el-input(v-model="formData.name" placeholder="请输入" maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="编号")
								el-input(v-model="formData.code" placeholder="请输入" clearable maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item
								template(#label)
									span
										span 供应商类别
										el-popover(placement="top-start" content="“系统设置-数据字典” 维护" :show-after="300" width="200")
											template(#reference)
												el-icon._label-icon
													QuestionFilled
								el-select(v-model="formData.classify" placeholder="请选择" clearable)
									el-option(v-for="item in classifyList" :key="item.id" :label="item.name" :value="item.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item
								template(#label)
									span
										span 供应商等级
										el-popover(placement="top-start" content="“系统设置-数据字典” 维护" :show-after="300" width="200")
											template(#reference)
												el-icon._label-icon
													QuestionFilled
								el-select(v-model="formData.level" placeholder="请选择" clearable)
									el-option(v-for="item in levelList" :key="item.id" :label="item.name" :value="item.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="是否为客户")
								el-radio-group(v-model="formData.isClient")
									el-radio(:value="0") 否
									el-radio(:value="1") 是
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="开票类型")
								el-select(v-model="formData.invoiceType" placeholder="请选择" clearable)
									el-option(label="无" :value="1")
									el-option(label="增值税普票" :value="2")
									el-option(label="增值税专票" :value="3")
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
				.info-block
					._title 财务信息
					bank-list(v-model="formData.bankCards")
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
</template>

<style scoped lang="scss">

</style>
