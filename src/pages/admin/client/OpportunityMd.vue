<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {QuestionFilled} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import Http from "@/plugins/http.js";
import CommonUtil from "@/assets/js/commonUtil.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";
import {ApiDeptList} from "@/configuration/api/users.js";
import {ApiOpportunityAdd, ApiOpportunityInfo, ApiOpportunityUpdate} from "@/configuration/api/opportunity.js";

const router = useRouter()
const route = useRoute()

const loading = ref(false);
const committing = ref(false);
const title = ref('');
const formRef = ref();
const sourceOptions = ref([]);
const intentionOptions = ref([]);
const userOptions = ref([]);

const stageObj = {
	"1": {id: 1, name: '初步接触', tagType: 'primary'},
	"2": {id: 2, name: '需求确认', tagType: 'primary'},
	"3": {id: 3, name: '方案报价', tagType: 'warning'},
	"4": {id: 4, name: '谈判阶段', tagType: 'danger'},
	"5": {id: 5, name: '已成交', tagType: 'success'},
	"6": {id: 6, name: '已流失', tagType: 'info'},
}
const stageOptions = ref(Object.values(stageObj));
const isView = computed(() => String(route.query.mode || '') === 'info')

const formData = ref({
	id: null,
	name: '',
	leadsId: '',
	clientId: '',
	clientName: '',
	contactName: '',
	contactPhone: '',
	source: '',
	productIntent: '',
	expectedAmount: null,
	expectedDealTime: null,
	ownerId: '',
	nextContactTime: null,
	lastFollowTime: null,
	remark: '',
	stage: 1,
	winTime: null,
	loseReason: '',
	createTime: null,
	updateTime: null
})

const rules = {
	name: [{required: true, message: '请输入商机名称', trigger: 'change'}],
	clientName: [{required: true, message: '请输入客户名称', trigger: 'change'}],
	ownerId: [{required: true, message: '请选择负责人', trigger: 'change'}],
	expectedDealTime: [{required: true, message: '请选择预计成交日期', trigger: 'change'}],
	stage: [{required: true, message: '请选择商机阶段', trigger: 'change'}]
}

/** DB INTEGER 时间戳：兼容秒 / 毫秒 */
const toDisplayMs = (val) => {
	if (val == null || val === '') return null
	const n = Number(val)
	if (!Number.isFinite(n)) return null
	return n > 1e12 ? n : n * 1000
}
const formatDbDateTime = (val) => {
	const ms = toDisplayMs(val)
	return ms == null ? '-' : new Date(ms).toLocaleString('zh-CN', {hour12: false})
}
const createTimeText = computed(() => formatDbDateTime(formData.value.createTime))
const updateTimeText = computed(() => formatDbDateTime(formData.value.updateTime))

onMounted(() => {
	getDictList();
	getUserList();
	if (route.query.leadsId) formData.value.leadsId = route.query.leadsId;
	if (route.query.eid) {
		title.value = isView.value ? '商机详情' : '编辑商机';
		getBaseData();
	} else {
		title.value = '新增商机';
	}
})

const getDictList = () => {
	const params = {
		dictKey: ['OPPOR_SOURCE', 'PRODUCT_INTENTION']
	};
	Http.request(ApiSysDictionaryRows, params).then(res => {
		sourceOptions.value = res.list.filter(item => item.dictKey === 'OPPOR_SOURCE');
		intentionOptions.value = res.list.filter(item => item.dictKey === 'PRODUCT_INTENTION');
	}).catch(err => {
		console.log(err);
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
	Http.request(ApiOpportunityInfo, {id: route.query.eid}).then(res => {
		if (res.data) {
			formData.value = {
				...formData.value,
				...res.data,
				stage: res.data.stage != null ? Number(res.data.stage) : 1,
				expectedAmount: res.data.expectedAmount != null ? Number(res.data.expectedAmount) : null
			}
		}
	}).finally(() => {
		loading.value = false;
	})
}

const toCommit = async (formEl) => {
	if (isView.value) return;
	await formEl.validate(valid => {
		if (!valid) return CommonUtil.scrollToFirstError();
		committing.value = true;
		const params = getSubmitData();
		const API = params.id ? ApiOpportunityUpdate : ApiOpportunityAdd;
		Http.request(API, params).then(() => {
			ElMessage({
				type: 'success',
				showClose: true,
				message: params.id ? '商机已保存' : '商机已创建',
			})
			router.push({
				path: '/opportunity',
				query: {_t: Date.now()}
			})
		}).catch(err => {
			console.log(err);
		}).finally(() => {
			committing.value = false;
		})
	})
}

const getSubmitData = () => {
	const raw = CommonUtil.deepClone(formData.value);
	const out = {
		id: raw.id,
		name: raw.name,
		leadsId: raw.leadsId || null,
		clientId: raw.clientId || null,
		clientName: raw.clientName,
		contactName: raw.contactName,
		contactPhone: raw.contactPhone,
		source: raw.source,
		productIntent: raw.productIntent,
		expectedAmount: Number(raw.expectedAmount || 0),
		expectedDealTime: raw.expectedDealTime ? Number(raw.expectedDealTime) : null,
		ownerId: raw.ownerId || null,
		nextContactTime: raw.nextContactTime ? Number(raw.nextContactTime) : null,
		lastFollowTime: raw.lastFollowTime ? Number(raw.lastFollowTime) : null,
		remark: raw.remark,
		stage: Number(raw.stage || 1),
		winTime: raw.winTime ? Number(raw.winTime) : null,
		loseReason: raw.loseReason || ''
	}
	if (!out.id) delete out.id;
	return out;
}

</script>

<template lang="pug">
	.info-container(v-loading="loading")
		.info-header
			._title {{title}}
			._btn
				el-button(plain @click="router.go(-1)") 取 消
				el-button(v-if="!isView" type="primary" :loading="committing" @click="toCommit(formRef)") 保 存
		.info-body
			el-form(
				ref="formRef"
				:model="formData"
				:rules="rules"
				label-position="top"
				@submit.prevent
				label-width="auto"
				:disabled="isView"
			)
				.info-block
					._title 基础信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="商机名称" prop="name")
								el-input(v-model="formData.name" placeholder="请输入" maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="客户名称" prop="clientName")
								el-input(v-model="formData.clientName" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="联系人")
								el-input(v-model="formData.contactName" placeholder="请输入" clearable maxlength="32")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="联系电话")
								el-input(v-model="formData.contactPhone" placeholder="请输入" clearable maxlength="32")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(prop="source")
								template(#label)
									span
										span 商机来源
										el-popover(placement="top-start" content="“系统设置-数据字典” 维护" :show-after="300" width="200")
											template(#reference)
												el-icon._label-icon
													QuestionFilled
								el-select(v-model="formData.source" placeholder="请选择" clearable filterable)
									el-option(v-for="item in sourceOptions" :key="item.id" :label="item.name" :value="item.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(prop="productIntent")
								template(#label)
									span
										span 产品意向
										el-popover(placement="top-start" content="“系统设置-数据字典” 维护" :show-after="300" width="200")
											template(#reference)
												el-icon._label-icon
													QuestionFilled
								el-select(v-model="formData.productIntent" placeholder="请选择" clearable filterable)
									el-option(v-for="item in intentionOptions" :key="item.id" :label="item.name" :value="item.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="商机阶段" prop="stage")
								el-select(v-model="formData.stage" placeholder="请选择" clearable)
									el-option(v-for="item in stageOptions" :key="item.id" :label="item.name" :value="item.id")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="当前负责人" prop="ownerId")
								el-cascader(v-model="formData.ownerId"
									style="width: 100%"
									:options="userOptions"
									:props="{label: 'name', value: 'id', emitPath: false}"
									filterable
									clearable)
				.info-block
					._title 跟进信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="预计成交金额")
								el-input-number(
									style="width: 100%"
									:max="9999999999"
									:min="0"
									:value-on-clear="null"
									:controls="false"
									:precision="2"
									disabled-scientific
									v-model="formData.expectedAmount"
									placeholder="请输入金额"
								)
									template(#suffix) ￥
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="预计成交日期" prop="expectedDealTime")
								el-date-picker(v-model="formData.expectedDealTime"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									clearable
									format="YYYY-MM-DD"
									value-format="X")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="下次联系时间")
								el-date-picker(v-model="formData.nextContactTime"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									clearable
									format="YYYY-MM-DD"
									value-format="X")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="最后跟进时间")
								el-date-picker(v-model="formData.lastFollowTime"
									style="width: 100%"
									type="datetime"
									placeholder="请选择"
									clearable
									format="YYYY-MM-DD HH:mm"
									value-format="X")
						el-col(:xs="24" :sm="12" :md="16" :lg="16" :xl="12")
							el-form-item(label="备注")
								el-input(v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入" maxlength="2000" show-word-limit)
						el-col(:xs="24" :sm="12" :md="16" :lg="16" :xl="12" v-if="Number(formData.stage) === 6 || (isView && formData.loseReason)")
							el-form-item(label="流失原因")
								el-input(v-model="formData.loseReason" type="textarea" :rows="3" placeholder="请输入流失原因" maxlength="500" show-word-limit)
				.info-block(v-if="isView")
					._title 系统信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="创建时间")
								el-input(:model-value="createTimeText" placeholder="-" disabled)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="最近更新")
								el-input(:model-value="updateTimeText" placeholder="-" disabled)
</template>

<style scoped lang="scss">

</style>
