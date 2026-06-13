<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Search, RefreshLeft, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Http from '@/plugins/http.js';
import ExportImport from '@/components/ExportImport.vue';
import {
	ApiReceiptOptions,
	ApiReceiptQueryList,
	ApiReceiptAdd,
	ApiReceiptUpdate,
	ApiReceiptDelete,
	ApiReceiptExport,
	ApiPaymentOptions,
	ApiPaymentQueryList,
	ApiPaymentAdd,
	ApiPaymentUpdate,
	ApiPaymentDelete,
	ApiPaymentExport
} from '@/configuration/api/finance.js';

const props = defineProps({
	kind: {
		type: String,
		default: 'receipt'
	}
});
const route = useRoute();

const labels = computed(() => {
	const isReceipt = props.kind === 'receipt';
	return {
		isReceipt,
		pageTitle: isReceipt ? '收款记录' : '付款记录',
		no: isReceipt ? '收款单号' : '付款单号',
		type: isReceipt ? '收款类型' : '付款类型',
		nature: isReceipt ? '收款性质' : '付款性质',
		date: isReceipt ? '收款日期' : '付款日期',
		amount: isReceipt ? '收款金额' : '付款金额',
		handler: isReceipt ? '收款人' : '付款人',
		add: isReceipt ? '新增收款' : '新增付款',
		edit: isReceipt ? '编辑收款' : '编辑付款',
		delete: isReceipt ? '删除收款' : '删除付款',
		exportPrefix: isReceipt ? '收款记录导出' : '付款记录导出'
	};
});

const apiSet = computed(() => {
	if (props.kind === 'receipt') {
		return {
			options: ApiReceiptOptions,
			queryList: ApiReceiptQueryList,
			add: ApiReceiptAdd,
			update: ApiReceiptUpdate,
			delete: ApiReceiptDelete,
			exportApi: ApiReceiptExport
		};
	}
	return {
		options: ApiPaymentOptions,
		queryList: ApiPaymentQueryList,
		add: ApiPaymentAdd,
		update: ApiPaymentUpdate,
		delete: ApiPaymentDelete,
		exportApi: ApiPaymentExport
	};
});

const loading = ref(false);
const committing = ref(false);
const tableData = ref([]);
const typeList = ref([]);
const natureList = ref([]);
const categoryList = ref([]);
const accountList = ref([]);
const clientList = ref([]);
const supplierList = ref([]);
const userList = ref([]);

const queryForm = reactive({
	conditions: '',
	typeName: '',
	nature: '',
	accountId: '',
	counterpartyType: '',
	counterpartyId: '',
	status: '',
	date: []
});
// HMR 兼容：旧模板可能仍引用 filter.conditions
const filter = queryForm;

const pager = reactive({
	page: 1,
	rows: 50,
	total: 0,
	pageCount: 0
});

const dialogVisible = ref(false);
const infoVisible = ref(false);
const formRef = ref();
const infoRow = ref(null);
const rowData = reactive({
	title: '',
	id: '',
	recordNo: '',
	typeName: '',
	nature: '',
	category: '',
	counterpartyType: props.kind === 'receipt' ? 'client' : 'supplier',
	counterpartyId: '',
	counterpartyName: '',
	accountId: '',
	amount: null,
	dateTime: '',
	handlerId: '',
	remark: ''
});

const rules = reactive({
	typeName: [{ required: true, message: `请选择${labels.value.type}`, trigger: 'change' }],
	accountId: [{ required: true, message: '请选择收付款账户', trigger: 'change' }],
	counterpartyName: [{ required: true, message: '请填写往来单位', trigger: 'blur' }],
	amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
	dateTime: [{ required: true, message: '请选择业务日期', trigger: 'change' }]
});

const counterpartyOptions = computed(() => {
	if (rowData.counterpartyType === 'client') return clientList.value;
	if (rowData.counterpartyType === 'supplier') return supplierList.value;
	return [];
});

const filterCounterpartyOptions = computed(() => {
	if (queryForm.counterpartyType === 'client') return clientList.value;
	if (queryForm.counterpartyType === 'supplier') return supplierList.value;
	return [];
});

const excelField = computed(() => [
	{ key: 'recordNo', name: labels.value.no },
	{ key: 'typeName', name: labels.value.type },
	{ key: 'nature', name: labels.value.nature },
	{ key: 'counterpartyName', name: '往来单位' },
	{ key: 'accountText', name: '收付款账户' },
	{ key: 'amountText', name: labels.value.amount },
	{ key: 'handlerName', name: labels.value.handler },
	{ key: 'dateTimeText', name: labels.value.date },
	{ key: 'category', name: '收支类别' },
	{ key: 'statusName', name: '状态' },
	{ key: 'remark', name: '备注' },
	{ key: 'createTimeText', name: '创建时间' }
]);

const exportParams = computed(() => {
	const params = getParams();
	delete params.page;
	delete params.rows;
	return params;
});

onMounted(async () => {
	await loadBaseOptions();
	const queryClientId = String(route.query?.clientId || '');
	if (queryClientId) {
		queryForm.counterpartyType = 'client';
		queryForm.counterpartyId = queryClientId;
	}
	getBaseData();
});

const formatMoney = (val) => {
	const num = Number(val || 0);
	return num > 0 ? num.toFixed(2) : '0.00';
};

const loadBaseOptions = async () => {
	try {
		const res = await Http.request(apiSet.value.options, {});
		typeList.value = res.typeList || [];
		natureList.value = res.natureList || [];
		categoryList.value = res.categoryList || [];
		accountList.value = res.accountList || [];
		clientList.value = res.clientList || [];
		supplierList.value = res.supplierList || [];
		userList.value = res.userList || [];
	} catch (err) {}
};

const getParams = () => {
	const params = {
		page: pager.page,
		rows: pager.rows
	};
	if (queryForm.conditions) params.conditions = queryForm.conditions;
	if (queryForm.typeName) params.typeName = queryForm.typeName;
	if (queryForm.nature) params.nature = queryForm.nature;
	if (queryForm.accountId) params.accountId = queryForm.accountId;
	if (queryForm.counterpartyType) params.counterpartyType = queryForm.counterpartyType;
	if (queryForm.counterpartyId) params.counterpartyId = queryForm.counterpartyId;
	if (queryForm.status !== '' && queryForm.status !== undefined && queryForm.status !== null) params.status = Number(queryForm.status);
	if (queryForm.date?.length) {
		params.dateBd = Number(queryForm.date[0]);
		params.dateEd = Number(queryForm.date[1]);
	}
	return params;
};

const getBaseData = () => {
	loading.value = true;
	Http.request(apiSet.value.queryList, getParams()).then(res => {
		pager.total = Number(res.total || 0);
		pager.pageCount = Number(res.pageCount || 0);
		tableData.value = (res.list || []).map(item => ({
			...item,
			statusName: Number(item.status) === 1 ? '正常' : '作废'
		}));
	}).finally(() => {
		loading.value = false;
	});
};

const handleCurrentChange = () => {
	getBaseData();
};

const resetFilter = () => {
	queryForm.conditions = '';
	queryForm.typeName = '';
	queryForm.nature = '';
	queryForm.accountId = '';
	queryForm.counterpartyType = '';
	queryForm.counterpartyId = '';
	queryForm.status = '';
	queryForm.date = [];
	pager.page = 1;
	getBaseData();
};

const resetForm = () => {
	rowData.id = '';
	rowData.recordNo = '';
	rowData.typeName = '';
	rowData.nature = '';
	rowData.category = '';
	rowData.counterpartyType = props.kind === 'receipt' ? 'client' : 'supplier';
	rowData.counterpartyId = '';
	rowData.counterpartyName = '';
	rowData.accountId = '';
	rowData.amount = null;
	rowData.dateTime = '';
	rowData.handlerId = '';
	rowData.remark = '';
};

const toAdd = () => {
	dialogVisible.value = true;
	rowData.title = labels.value.add;
	resetForm();
	const queryClientId = String(route.query?.clientId || '');
	if (queryClientId) {
		rowData.counterpartyType = 'client';
		rowData.counterpartyId = queryClientId;
		const client = clientList.value.find(item => String(item.id) === queryClientId);
		rowData.counterpartyName = client?.name || '';
	}
};

const toEdit = (row) => {
	dialogVisible.value = true;
	rowData.title = labels.value.edit;
	rowData.id = row.id;
	rowData.recordNo = row.recordNo || '';
	rowData.typeName = row.typeName || '';
	rowData.nature = row.nature || '';
	rowData.category = row.category || '';
	rowData.counterpartyType = row.counterpartyType || 'other';
	rowData.counterpartyId = row.counterpartyId || '';
	rowData.counterpartyName = row.counterpartyName || '';
	rowData.accountId = row.accountId || '';
	rowData.amount = Number(row.amount || 0) || null;
	rowData.dateTime = String(row.dateTime || '');
	rowData.handlerId = row.handlerId || '';
	rowData.remark = row.remark || '';
};

const onCounterpartyTypeChange = () => {
	rowData.counterpartyId = '';
	rowData.counterpartyName = '';
};

const onCounterpartyIdChange = (id) => {
	const list = counterpartyOptions.value || [];
	const find = list.find(item => String(item.id) === String(id));
	rowData.counterpartyName = find?.name || '';
};

const onFilterCounterpartyTypeChange = () => {
	queryForm.counterpartyId = '';
};

const toCommit = async () => {
	if (!formRef.value) return;
	try {
		await formRef.value.validate();
		committing.value = true;
		const params = {
			id: rowData.id || undefined,
			recordNo: rowData.recordNo || undefined,
			typeName: rowData.typeName,
			nature: rowData.nature || undefined,
			category: rowData.category || undefined,
			counterpartyType: rowData.counterpartyType,
			counterpartyId: rowData.counterpartyId || undefined,
			counterpartyName: rowData.counterpartyName,
			accountId: rowData.accountId,
			amount: Number(rowData.amount || 0),
			dateTime: Number(rowData.dateTime),
			handlerId: rowData.handlerId || undefined,
			remark: rowData.remark || undefined
		};
		const API = rowData.id ? apiSet.value.update : apiSet.value.add;
		await Http.request(API, params);
		ElMessage({
			type: 'success',
			showClose: true,
			message: rowData.id ? `${labels.value.edit}成功` : `${labels.value.add}成功`
		});
		dialogVisible.value = false;
		pager.page = 1;
		getBaseData();
	} finally {
		committing.value = false;
	}
};

const toDelete = (row) => {
	ElMessageBox.confirm(`确定作废“${row.recordNo}”？作废后将自动冲回账户余额并作废对应日记账。`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
		loading.value = true;
		Http.request(apiSet.value.delete, { id: row.id }).then(() => {
			ElMessage({
				type: 'success',
				showClose: true,
				message: '作废成功'
			});
			getBaseData();
		}).finally(() => {
			loading.value = false;
		});
	}).catch(() => {});
};

const toInfo = (row) => {
	infoRow.value = row;
	infoVisible.value = true;
};
</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(
					v-model="queryForm.conditions"
					clearable
					:placeholder="`${labels.no} / 往来单位 / 备注`"
					@keyup.enter="getBaseData"
					@clear="getBaseData"
				)
				el-select(v-model="queryForm.typeName" filterable :placeholder="labels.type" clearable @clear="getBaseData")
					el-option(v-for="item in typeList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="queryForm.nature" filterable :placeholder="labels.nature" clearable @clear="getBaseData")
					el-option(v-for="item in natureList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="queryForm.accountId" filterable placeholder="收付款账户" clearable @clear="getBaseData")
					el-option(v-for="item in accountList" :key="item.id" :label="item.label" :value="item.id")
				el-select(v-model="queryForm.counterpartyType" filterable placeholder="往来单位类型" clearable @change="onFilterCounterpartyTypeChange")
					el-option(label="客户" value="client")
					el-option(label="供应商" value="supplier")
				el-select(v-if="queryForm.counterpartyType" v-model="queryForm.counterpartyId" filterable placeholder="往来单位" clearable)
					el-option(v-for="item in filterCounterpartyOptions" :key="item.id" :label="item.name" :value="item.id")
				el-select(v-model="queryForm.status" filterable placeholder="状态" clearable)
					el-option(label="正常" :value="1")
					el-option(label="作废" :value="2")
				el-date-picker(
					v-model="queryForm.date"
					type="daterange"
					range-separator="至"
					:start-placeholder="labels.date"
					end-placeholder="--"
					value-format="X"
					@clear="getBaseData"
				)
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain @click="toAdd") {{ labels.add }}
				export-import(
					:excel-field="excelField"
					:export-api="apiSet.exportApi"
					:export-params="exportParams"
					:export-file-name-prefix="labels.exportPrefix"
				)
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1 }}
				el-table-column(prop="recordNo" :label="labels.no" width="170")
				el-table-column(prop="typeName" :label="labels.type" width="120")
				el-table-column(prop="nature" :label="labels.nature" width="120")
				el-table-column(prop="counterpartyName" label="往来单位" min-width="170")
				el-table-column(prop="accountText" label="收付款账户" width="170")
				el-table-column(prop="amount" :label="labels.amount" width="120" align="right" header-align="center")
					template(#default="{row}") {{ formatMoney(row.amount) }}
				el-table-column(prop="handlerName" :label="labels.handler" width="110")
				el-table-column(prop="dateTimeText" :label="labels.date" width="120")
				el-table-column(prop="category" label="收支类别" width="130")
				el-table-column(prop="statusName" label="状态" width="90" align="center")
					template(#default="{row}")
						el-tag(v-if="Number(row.status) === 1" type="success" size="small") 正常
						el-tag(v-else type="info" size="small") 作废
				el-table-column(label="操作" width="140")
					template(#default="{row}")
						.tab-link
							el-link(underline="never" type="primary" @click="toInfo(row)") 查看
							el-link(v-if="Number(row.status) === 1" underline="never" type="primary" @click="toEdit(row)") 编辑
							el-link(v-if="Number(row.status) === 1" underline="never" type="danger" @click="toDelete(row)") 作废
		.panel-footer
			.total-section
				span 共 {{ pager.total }} 条记录
				span._sec 第 {{ pager.page }} / {{ pager.pageCount }} 页
			el-pagination(
				v-model:current-page="pager.page"
				layout="prev, pager, next"
				:page-size="pager.rows"
				size="small"
				:total="pager.total"
				@current-change="handleCurrentChange"
				background
			)

	el-dialog(
		v-model="dialogVisible"
		width="560"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		:title="rowData.title"
	)
		el-form(ref="formRef" :model="rowData" :rules="rules" label-width="auto")
			el-form-item(:label="labels.no")
				el-input(v-model="rowData.recordNo" placeholder="不填则自动生成" :disabled="!!rowData.id")
			el-form-item(:label="labels.date" prop="dateTime")
				el-date-picker(v-model="rowData.dateTime" type="date" value-format="X" placeholder="请选择日期" style="width: 100%")
			el-form-item(:label="labels.type" prop="typeName")
				el-select(v-model="rowData.typeName" placeholder="请选择" clearable filterable)
					el-option(v-for="item in typeList" :key="item.id" :label="item.name" :value="item.name")
			el-form-item(:label="labels.nature")
				el-select(v-model="rowData.nature" placeholder="请选择" clearable filterable)
					el-option(v-for="item in natureList" :key="item.id" :label="item.name" :value="item.name")
			el-form-item(label="收支类别")
				el-select(v-model="rowData.category" placeholder="请选择" clearable filterable)
					el-option(v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.name")
			el-form-item(label="往来单位类型")
				el-select(v-model="rowData.counterpartyType" placeholder="请选择" clearable @change="onCounterpartyTypeChange")
					el-option(label="客户" value="client")
					el-option(label="供应商" value="supplier")
					el-option(label="其他" value="other")
			el-form-item(v-if="rowData.counterpartyType !== 'other'" label="往来单位")
				el-select(v-model="rowData.counterpartyId" placeholder="请选择" clearable filterable @change="onCounterpartyIdChange")
					el-option(v-for="item in counterpartyOptions" :key="item.id" :label="item.name" :value="item.id")
			el-form-item(label="往来单位名称" prop="counterpartyName")
				el-input(v-model="rowData.counterpartyName" placeholder="请输入往来单位名称")
			el-form-item(label="收付款账户" prop="accountId")
				el-select(v-model="rowData.accountId" placeholder="请选择账户" clearable filterable)
					el-option(v-for="item in accountList" :key="item.id" :label="item.label" :value="item.id")
			el-form-item(:label="labels.amount" prop="amount")
				el-input-number(
					v-model="rowData.amount"
					style="width: 100%"
					:max="9999999999"
					:min="0"
					:value-on-clear="null"
					:controls="false"
					:precision="2"
					disabled-scientific
					placeholder="请输入金额"
				)
					template(#suffix) ￥
			el-form-item(:label="labels.handler")
				el-select(v-model="rowData.handlerId" placeholder="请选择" clearable filterable)
					el-option(v-for="item in userList" :key="item.id" :label="item.name" :value="item.id")
			el-form-item(label="备注")
				el-input(v-model="rowData.remark" type="textarea" maxlength="120" :rows="3" placeholder="可填写摘要、说明等")
		template(#footer)
			el-button(@click="dialogVisible = false") 取消
			el-button(type="primary" :loading="committing" @click="toCommit") 保存

	el-dialog(
		v-model="infoVisible"
		width="560"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		:title="`${labels.pageTitle}详情`"
	)
		el-descriptions(:column="2" border size="small" v-if="infoRow")
			el-descriptions-item(:label="labels.no") {{ infoRow.recordNo || '--' }}
			el-descriptions-item(:label="labels.date") {{ infoRow.dateTimeText || '--' }}
			el-descriptions-item(:label="labels.type") {{ infoRow.typeName || '--' }}
			el-descriptions-item(:label="labels.nature") {{ infoRow.nature || '--' }}
			el-descriptions-item(label="收支类别") {{ infoRow.category || '--' }}
			el-descriptions-item(label="状态")
				el-tag(v-if="Number(infoRow.status) === 1" type="success" size="small") 正常
				el-tag(v-else type="info" size="small") 作废
			el-descriptions-item(label="往来单位") {{ infoRow.counterpartyName || '--' }}
			el-descriptions-item(label="收付款账户") {{ infoRow.accountText || '--' }}
			el-descriptions-item(:label="labels.amount") {{ formatMoney(infoRow.amount) }}
			el-descriptions-item(:label="labels.handler") {{ infoRow.handlerName || '--' }}
			el-descriptions-item(label="备注" :span="2") {{ infoRow.remark || '--' }}
			el-descriptions-item(label="创建时间" :span="2") {{ infoRow.createTimeText || '--' }}
</template>

<style scoped lang="scss">
</style>
