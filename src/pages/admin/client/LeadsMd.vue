<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {QuestionFilled} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'

import Http from "@/plugins/http.js";
import CommonUtil from "@/assets/js/commonUtil.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";
import {ApiDeptList} from "@/configuration/api/users.js";
import {ApiLeadsAdd, ApiLeadsInfo, ApiLeadsUpdate} from "@/configuration/api/leads.js";
import {ApiClientQueryList} from "@/configuration/api/client.js";

const router = useRouter()
const route = useRoute()

const loading = ref(false);
const committing = ref(false);
const title = ref('');
const formRef = ref();

const isView = computed(() => String(route.query.mode || '') === 'info')

const sourceOptions = ref([]);
const intentionOptions = ref([]);
const userOptions = ref([]);
const clientOptions = ref([]);

const statusObj = {
	"1": {id: 1, name: '新录入', tagType: 'danger'},
	"2": {id: 2, name: '跟进中', tagType: 'warning'},
	"3": {id: 3, name: '已转化', tagType: 'success'},
	"4": {id: 4, name: '已流失', tagType: 'info'}
}
const statusOptions = ref(Object.values(statusObj));

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

const formData = ref({
	id: null,
	name: '',
	clientId: '',
	clientName: '',
	contactName: '',
	contactPhone: '',
	source: '',
	productIntent: '',
	status: 1,
	ownerId: '',
	nextContactTime: null,
	lastContactTime: null,
	remark: '',
	tags: '',
	loseReason: '',
	isConverted: 0,
	convertTime: null,
	convertClientId: '',
	convertOpportunityId: '',
	tagsText: '',
	createTime: null,
	createBy: '',
	updateTime: null,
	updateBy: ''
})

const showConvertBlock = computed(() =>
	Number(formData.value.isConverted) === 1 || !!formData.value.convertTime
		|| !!formData.value.convertClientId || !!formData.value.convertOpportunityId
)

const createTimeText = computed(() => formatDbDateTime(formData.value.createTime))
const updateTimeText = computed(() => formatDbDateTime(formData.value.updateTime))
const lastContactTimeText = computed(() => formatDbDateTime(formData.value.lastContactTime))
const convertTimeText = computed(() => formatDbDateTime(formData.value.convertTime))

const rules = {
	name: [{required: true, message: '请输入线索名称', trigger: 'change'}],
	status: [{required: true, message: '请选择线索状态', trigger: 'change'}]
}

onMounted(() => {
	getDictList();
	getUserList();
	getClientList();
	if (route.query.eid) {
		title.value = isView.value ? '线索详情' : '编辑线索';
		getBaseData();
	} else {
		title.value = '新增线索';
	}
})

const getDictList = () => {
	const params = {
		dictKey: ['LEADS_SOURCE', 'PRODUCT_INTENTION']
	};
	Http.request(ApiSysDictionaryRows, params).then(res => {
		sourceOptions.value = res.list.filter(item => item.dictKey === 'LEADS_SOURCE');
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

const getClientList = () => {
	Http.request(ApiClientQueryList, {
		page: 1,
		rows: 1000
	}).then(res => {
		clientOptions.value = (res.list || []).map(item => ({
			id: item.id,
			name: item.name
		}));
	}).catch(err => {
		console.log(err);
	})
}

const parseTagsText = (tagsVal) => {
	if (!tagsVal) return '';
	if (Array.isArray(tagsVal)) return tagsVal.join('，');
	if (typeof tagsVal !== 'string') return String(tagsVal);
	try {
		const parsed = JSON.parse(tagsVal);
		if (Array.isArray(parsed)) return parsed.join('，');
	} catch (e) {
		// ignore
	}
	return tagsVal;
}

const getBaseData = () => {
	loading.value = true;
	Http.request(ApiLeadsInfo, {id: route.query.eid}).then(res => {
		loading.value = false;
		if (res.data) {
			formData.value = {
				...formData.value,
				...res.data,
				clientId: res.data.clientId || '',
				status: res.data.status != null ? Number(res.data.status) : 1,
				isConverted: res.data.isConverted != null ? Number(res.data.isConverted) : 0,
				tagsText: parseTagsText(res.data.tags)
			}
		}
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}

const toCommit = async (formEl) => {
	if (isView.value) return;
	await formEl.validate(valid => {
		if (!valid) return CommonUtil.scrollToFirstError();
		const params = getSubmitData();
		committing.value = true;
		const API = params.id ? ApiLeadsUpdate : ApiLeadsAdd;
		Http.request(API, params).then(() => {
			committing.value = false;
			ElMessage({
				type: 'success',
				showClose: true,
				message: params.id ? '线索已保存' : '线索已创建',
			})
			router.push({
				path: '/leads',
				query: {_t: Date.now()}
			})
		}).catch(err => {
			console.log(err);
			committing.value = false;
		})
	})
}

const getSubmitData = () => {
	const raw = CommonUtil.deepClone(formData.value);
	const keys = [
		'id', 'name', 'clientId', 'contactName', 'contactPhone',
		'source', 'productIntent', 'status', 'ownerId', 'nextContactTime',
		'remark', 'loseReason'
	];
	const out = {};
	for (const k of keys) {
		if (raw[k] !== undefined) out[k] = raw[k];
	}
	out.tags = raw.tagsText || '';
	out.status = out.status != null ? Number(out.status) : 1;
	if (out.nextContactTime === '' || out.nextContactTime === undefined) {
		out.nextContactTime = null;
	} else {
		out.nextContactTime = Number(out.nextContactTime);
	}
	if (out.ownerId === '') out.ownerId = null;
	if (out.clientId === '') out.clientId = null;
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
							el-form-item(label="线索名称" prop="name")
								el-input(v-model="formData.name" placeholder="请输入" maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="关联客户")
								el-select(v-model="formData.clientId" placeholder="可选，选择已存在客户" clearable filterable)
									el-option(v-for="item in clientOptions" :key="item.id" :label="item.name" :value="item.id")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="联系人" prop="contactName")
								el-input(v-model="formData.contactName" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="联系电话" prop="contactPhone")
								el-input(v-model="formData.contactPhone" placeholder="请输入" clearable maxlength="32")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(prop="source")
								template(#label)
									span
										span 线索来源
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
							el-form-item(label="线索状态" prop="status")
								el-select(v-model="formData.status" placeholder="请选择" clearable)
									el-option(v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="当前负责人" prop="ownerId")
								el-cascader(v-model="formData.ownerId"
									style="width: 100%"
									:options="userOptions"
									:props="{label: 'name', value: 'id', emitPath: false}",
									filterable
									clearable)

				.info-block
					._title 跟进信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="下次联系时间" prop="nextContactTime")
								el-date-picker(v-model="formData.nextContactTime"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									clearable
									format="YYYY-MM-DD"
									value-format="X")
						el-col(:xs="24" :sm="12" :md="16" :lg="16" :xl="12")
							el-form-item(label="备注" prop="remark")
								el-input(v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入" maxlength="2000" show-word-limit)
						el-col(:xs="24" :sm="12" :md="16" :lg="16" :xl="12" v-if="Number(formData.status) === 4 || (isView && formData.loseReason)")
							el-form-item(label="流失原因")
								el-input(v-model="formData.loseReason" type="textarea" :rows="3" placeholder="请输入流失原因" maxlength="500" show-word-limit)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="标签" prop="tags")
								el-input(v-model="formData.tagsText" placeholder="多个可用逗号分隔" clearable maxlength="512")

				.info-block(v-if="isView")
					._title 系统信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="创建时间")
								el-input(:model-value="createTimeText" placeholder="-" disabled)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="最近更新")
								el-input(:model-value="updateTimeText" placeholder="-" disabled)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="上次联系时间")
								el-input(:model-value="lastContactTimeText" placeholder="-" disabled)

				.info-block(v-if="isView && showConvertBlock")
					._title 转化信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="是否已转化")
								el-tag(size="small" :type="Number(formData.isConverted) === 1 ? 'success' : 'info'") {{ Number(formData.isConverted) === 1 ? '是' : '否' }}
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="转化时间")
								el-input(:model-value="convertTimeText" placeholder="-" disabled)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="转化客户 ID")
								el-input(:model-value="formData.convertClientId || '-'" placeholder="-" disabled)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="转化商机 ID")
								el-input(:model-value="formData.convertOpportunityId || '-'" placeholder="-" disabled)
</template>

<style scoped lang="scss">

</style>
