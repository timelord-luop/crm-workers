<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {Search, RefreshLeft, Plus} from '@element-plus/icons-vue';
import Http from "@/plugins/http.js";
import {ApiAccountList, ApiSysDictionaryRows} from "@/configuration/api/common.js";
import {
	ApiDayBookAdd,
	ApiDayBookDelete,
	ApiDayBookExport,
	ApiDayBookQueryList,
	ApiDayBookUpdate
} from "@/configuration/api/dayBook.js";
import {ElMessage, ElMessageBox} from "element-plus";
import ExportImport from "@/components/ExportImport.vue";

const loading = ref(false);
const committing = ref(false);
const tableData = ref([]);
const categoryList = ref([]);
const accountList = ref([]);

const filter = reactive({
	conditions: '',
	date: [],
	category: '',
	sourceType: '',
	sourceNo: ''
});
const sourceTypeList = [
	{ id: 'manual', name: '手工日记账' },
	{ id: 'receipt', name: '收款联动' },
	{ id: 'payment', name: '付款联动' }
];

const pager = reactive({
	page: 1,
	rows: 50,
	total: 0,
	pageCount: 0
});

const dialogVisible = ref(false);
const formRef = ref();
const rowData = reactive({
	title: '',
	id: null,
	accountId: '',
	dateTime: '',
	digest: '',
	category: '',
	lend: null,
	loan: null
});

const rules = reactive({
	accountId: [{required: true, message: '请选择账户名称', trigger: 'change'}],
	dateTime: [{required: true, message: '请选择出纳日期', trigger: 'change'}],
	category: [{required: true, message: '请选择收支类别', trigger: 'change'}]
});

const excelField = [
	{key: 'accountText', name: '账户名称'},
	{key: 'dateTimeText', name: '出纳日期'},
	{key: 'digest', name: '摘要'},
	{key: 'lendText', name: '借（收入）'},
	{key: 'loanText', name: '贷（支出）'},
	{key: 'category', name: '收支类别'},
	{key: 'sourceTypeText', name: '来源类型'},
	{key: 'sourceNo', name: '来源单号'},
	{key: 'createTimeText', name: '记账时间'}
];

const dayBookExportParams = computed(() => {
	const params = getParams();
	delete params.page;
	delete params.rows;
	return params;
});

onMounted(() => {
	getDictList();
	getAccountList();
	getBaseData();
});

const getDictList = () => {
	Http.request(ApiSysDictionaryRows, {
		dictKey: ['IN_OUT_CATEGOREY']
	}).then(res => {
		categoryList.value = res.list.filter(item => item.dictKey === 'IN_OUT_CATEGOREY');
	});
};

const flattenAccounts = (list) => {
	const output = [];
	const walk = (rows = []) => {
		rows.forEach(item => {
			if (item.level === 2 && item.status === 1) {
				output.push({
					id: item.id,
					name: item.name,
					code: item.code,
					label: item.code ? `${item.code}-${item.name}` : item.name
				});
			}
			if (item.children?.length) walk(item.children);
		});
	};
	walk(list);
	return output;
};

const getAccountList = () => {
	Http.request(ApiAccountList).then(res => {
		accountList.value = flattenAccounts(res.list || []);
	});
};

const getParams = () => {
	const params = {
		page: pager.page,
		rows: pager.rows
	};
	if (filter.conditions) params.conditions = filter.conditions;
	if (filter.category) params.category = filter.category;
	if (filter.sourceType) params.sourceType = filter.sourceType;
	if (filter.sourceNo) params.sourceNo = filter.sourceNo;
	if (filter.date?.length) {
		params.dateBd = Number(filter.date[0]);
		params.dateEd = Number(filter.date[1]);
	}
	return params;
};

const getBaseData = () => {
	loading.value = true;
	Http.request(ApiDayBookQueryList, getParams()).then(res => {
		pager.total = res.total;
		pager.pageCount = res.pageCount;
		tableData.value = (res.list || []).map(item => ({
			...item,
			sourceTypeText: getSourceTypeText(item)
		}));
	}).finally(() => {
		loading.value = false;
	});
};

const handleCurrentChange = () => {
	getBaseData();
};

const resetFilter = () => {
	filter.conditions = '';
	filter.date = [];
	filter.category = '';
	filter.sourceType = '';
	filter.sourceNo = '';
	pager.page = 1;
	getBaseData();
};

const toAdd = () => {
	dialogVisible.value = true;
	rowData.title = '新增日记账';
	rowData.id = null;
	rowData.accountId = '';
	rowData.dateTime = '';
	rowData.digest = '';
	rowData.category = '';
	rowData.lend = null;
	rowData.loan = null;
};

const toEdit = (row) => {
	dialogVisible.value = true;
	rowData.title = '编辑日记账';
	rowData.id = row.id;
	rowData.accountId = row.accountId;
	rowData.dateTime = String(row.dateTime || '');
	rowData.digest = row.digest || '';
	rowData.category = row.category || '';
	rowData.lend = row.lend || null;
	rowData.loan = row.loan || null;
};

const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return;
		committing.value = true;
		const params = {
			id: rowData.id,
			accountId: rowData.accountId,
			dateTime: Number(rowData.dateTime),
			digest: rowData.digest,
			category: rowData.category,
			lend: Number(rowData.lend || 0),
			loan: Number(rowData.loan || 0)
		};
		const API = params.id ? ApiDayBookUpdate : ApiDayBookAdd;
		Http.request(API, params).then(() => {
			ElMessage({
				type: 'success',
				showClose: true,
				message: params.id ? '日记账更新成功' : '日记账新增成功'
			});
			dialogVisible.value = false;
			getBaseData();
		}).finally(() => {
			committing.value = false;
		});
	});
};

const toDelete = (row) => {
	ElMessageBox.confirm('确定删除该条日记账记录？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
		loading.value = true;
		Http.request(ApiDayBookDelete, {id: row.id}).then(() => {
			ElMessage({
				type: 'success',
				showClose: true,
				message: '删除成功'
			});
			getBaseData();
		}).finally(() => {
			loading.value = false;
		});
	}).catch(() => {});
};

const formatMoney = (val) => {
	const num = Number(val || 0);
	return num > 0 ? num.toFixed(2) : '';
};

const getSourceTypeText = (row) => {
	if (row.sourceBizType === 'receipt') return '收款联动';
	if (row.sourceBizType === 'payment') return '付款联动';
	if ((row.sourceType || 'manual') === 'manual') return '手工日记账';
	return '--';
};
</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(
					v-model="filter.conditions"
					clearable
					placeholder="账户名称 / 摘要"
					@keyup.enter="getBaseData"
					@clear="getBaseData"
				)
				el-input(
					v-model="filter.sourceNo"
					clearable
					placeholder="来源单号"
					@keyup.enter="getBaseData"
					@clear="getBaseData"
				)
				el-date-picker(
					v-model="filter.date"
					type="daterange"
					range-separator="至"
					start-placeholder="出纳日期"
					end-placeholder="--"
					value-format="X"
					@clear="getBaseData"
				)
				el-select(v-model="filter.category" filterable placeholder="收支类别" @clear="getBaseData" clearable)
					el-option(v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.sourceType" filterable placeholder="来源类型" @clear="getBaseData" clearable)
					el-option(v-for="item in sourceTypeList" :key="item.id" :label="item.name" :value="item.id")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain @click="toAdd") 新增日记账
				export-import(
					:excel-field="excelField"
					:export-api="ApiDayBookExport"
					:export-params="dayBookExportParams"
					export-file-name-prefix="日记账导出"
				)
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1 }}
				el-table-column(prop="accountText" label="账户名称" width="200")
				el-table-column(prop="dateTimeText" label="出纳日期" width="130")
				el-table-column(prop="digest" label="摘要")
				el-table-column(prop="lend" label="借（收入）" width="120" align="right" header-align="center")
					template(#default="{row}") {{ formatMoney(row.lend) }}
				el-table-column(prop="loan" label="贷（支出）" width="120" align="right" header-align="center")
					template(#default="{row}") {{ formatMoney(row.loan) }}
				el-table-column(prop="category" label="收支类别" width="140")
				el-table-column(prop="sourceTypeText" label="来源类型" width="120")
				el-table-column(prop="sourceNo" label="来源单号" width="160")
				el-table-column(prop="createTimeText" label="记账时间" width="140")
				el-table-column(label="操作" width="140")
					template(#default="{row}")
						.tab-link
							el-link(v-if="Number(row.immutableFlag || 0) !== 1" underline="never" type="primary" @click="toEdit(row)") 编辑
							el-link(v-if="Number(row.immutableFlag || 0) !== 1" underline="never" type="danger" @click="toDelete(row)") 删除
							span(v-if="Number(row.immutableFlag || 0) === 1") --
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
		width="520"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		:title="rowData.title"
	)
		el-form(ref="formRef" :model="rowData" :rules="rules" label-width="auto" @submit.prevent)
			el-form-item(label="账户名称" prop="accountId")
				el-select(v-model="rowData.accountId" placeholder="请选择账户" clearable filterable style="width: 100%")
					el-option(v-for="item in accountList" :key="item.id" :label="item.label" :value="item.id")
			el-form-item(label="出纳日期" prop="dateTime")
				el-date-picker(v-model="rowData.dateTime" type="date" value-format="X" placeholder="请选择日期" style="width: 100%")
			el-form-item(label="收支类别" prop="category")
				el-select(v-model="rowData.category" placeholder="请选择收支类别" clearable filterable)
					el-option(v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.name")
			el-form-item(label="摘要")
				el-input(v-model="rowData.digest" maxlength="120" placeholder="请输入摘要")
			el-form-item(label="借（收入）")
				el-input-number(
					v-model="rowData.lend"
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
			el-form-item(label="贷（支出）")
				el-input-number(
					v-model="rowData.loan"
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
		template(#footer)
			el-button(@click="dialogVisible = false") 取消
			el-button(type="primary" :loading="committing" @click="toCommit(formRef)") 保存
</template>

<style scoped lang="scss">

</style>
