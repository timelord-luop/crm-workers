<script setup>
import {useRouter} from "vue-router";
import {computed, onMounted, reactive, ref} from "vue";
import {Search, RefreshLeft, Plus, ArrowDown} from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";
import {ApiDeptList} from "@/configuration/api/users.js";
import {
	ApiOpportunityDelete,
	ApiOpportunityExport,
	ApiOpportunityQueryList,
	ApiOpportunityUpdateStage
} from "@/configuration/api/opportunity.js";
import CommonUtil from "@/assets/js/commonUtil.js";
import ExportImport from "@/components/ExportImport.vue";
import {ElMessage, ElMessageBox} from "element-plus";

const router = useRouter()

const loading = ref(false);
const userOptions = ref([]);
const statusObj = {
	"1": {id: 1, name: '初步接触', tagType: 'primary'},
	"2": {id: 2, name: '需求确认', tagType: 'primary'},
	"3": {id: 3, name: '方案报价', tagType: 'warning'},
	"4": {id: 4, name: '谈判阶段', tagType: 'danger'},
	"5": {id: 5, name: '已成交', tagType: 'success'},
	"6": {id: 6, name: '已流失', tagType: 'info'},
}
const statusList = ref(Object.values(statusObj));
const filter = reactive({
	conditions: '',
	principal: '',
	date: [],
	status: ''
});
const pager = reactive({
	page: 1,
	rows: 50,
	total: 0,
	pageCount: 0
});
const tableData = ref([]);

const excelField = [
	{key: 'name', name: '商机名称'},
	{key: 'clientName', name: '客户名称'},
	{key: 'expectedAmountText', name: '预计成交金额'},
	{key: 'ownerName', name: '当前负责人'},
	{key: 'expectedDealTimeText', name: '预计成交日期'},
	{key: 'nextContactTimeText', name: '下次联系时间'},
	{key: 'lastFollowTimeText', name: '最后跟进时间'},
	{key: 'stageName', name: '商机阶段'},
	{key: 'stageStayDays', name: '阶段停留时长(天)'},
	{key: 'createTimeText', name: '创建时间'}
];

const opportunityExportParams = computed(() => {
	const params = getParams();
	delete params.page;
	delete params.rows;
	return params;
});

onMounted(() => {
	getUserList();
	getBaseData();
})

const getUserList = () => {
	Http.request(ApiDeptList, {type: 'list'}).then(res => {
		userOptions.value = CommonUtil.arrayToChartTree(res.list);
	}).catch(err => {
		console.log(err);
	})
}
const handleSizeChange = (val) => {
	getBaseData();
}
const handleCurrentChange = (val) => {
	getBaseData();
}
const resetFilter = () => {
	filter.conditions = '';
	filter.principal = '';
	filter.date = [];
	filter.status = '';
	pager.page = 1;
	getBaseData();
}
const getBaseData = () => {
	loading.value = true;
	const params = getParams();
	Http.request(ApiOpportunityQueryList, params).then(res => {
		pager.total = res.total;
		pager.pageCount = res.pageCount;
		tableData.value = res.list || [];
	}).finally(() => {
		loading.value = false;
	})
}

const getParams = () => {
	let params = {
		page: pager.page,
		rows: pager.rows
	}
	if (filter.conditions) params.conditions = filter.conditions;
	if (filter.principal) params.ownerId = filter.principal;
	if (filter.status !== '' && filter.status != null) params.stage = Number(filter.status);
	if (filter.date?.length) {
		params.expectedDealBd = Number(filter.date[0]);
		params.expectedDealEd = Number(filter.date[1]);
	}
	return params;
}

const toMd = (row) => {
	if (row) {
		router.push({
			path: '/opportunity-md',
			query: {
				eid: row.id
			}
		})
	} else {
		router.push('/opportunity-md')
	}
}

const toInfo = (row) => {
	router.push({
		path: '/opportunity-md',
		query: {
			eid: row.id,
			mode: 'info'
		}
	})
}

const handleCommand = (command, row) => {
	if (command === 'delete') {
		ElMessageBox.confirm(`确定删除商机 “${row.name}” ?`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			loading.value = true;
			Http.request(ApiOpportunityDelete, {id: row.id}).then(() => {
				ElMessage({
					type: 'success',
					showClose: true,
					message: `已删除商机：${row.name}`,
				})
				getBaseData();
			}).finally(() => {
				loading.value = false;
			})
		}).catch(() => {})
	}
	if (String(command || '').startsWith('stage:')) {
		const stage = Number(String(command).split(':')[1]);
		if (!stage) return;
		if (stage === 6) {
			ElMessageBox.prompt('请输入流失原因', '设置商机为流失', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputType: 'textarea',
				inputPlaceholder: '请输入流失原因',
				inputValidator: (val) => !!String(val || '').trim() || '流失原因不能为空'
			}).then(({value}) => {
				loading.value = true;
				Http.request(ApiOpportunityUpdateStage, {
					id: row.id,
					stage,
					loseReason: String(value || '').trim()
				}).then(() => {
					row.stage = stage;
					row.loseReason = String(value || '').trim();
					ElMessage({
						type: 'success',
						showClose: true,
						message: '商机阶段更新成功',
					})
					getBaseData();
				}).finally(() => {
					loading.value = false;
				})
			}).catch(() => {})
		} else {
			loading.value = true;
			Http.request(ApiOpportunityUpdateStage, {id: row.id, stage}).then(() => {
				row.stage = stage;
				row.loseReason = '';
				ElMessage({
					type: 'success',
					showClose: true,
					message: '商机阶段更新成功',
				})
				getBaseData();
			}).finally(() => {
				loading.value = false;
			})
		}
	}
}

const formatMoney = (val) => Number(val || 0).toFixed(2)

</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions"
					clearable
					placeholder="商机名称 / 客户"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				el-cascader(v-model="filter.principal"
					placeholder="负责人"
					:options="userOptions"
					:show-all-levels="false"
					:props="{label: 'name', value: 'id', emitPath: false}",
					filterable)
				el-date-picker(v-model="filter.date"
					type="daterange"
					range-separator="至"
					start-placeholder="预计成交日"
					value-format="X"
					@clear="getBaseData"
					end-placeholder="--")
				el-select(v-model="filter.status" filterable placeholder="商机阶段" @clear="getBaseData" clearable)
					el-option(v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toMd") 新增商机
				export-import(
					:excel-field="excelField"
					:export-api="ApiOpportunityExport"
					:export-params="opportunityExportParams"
					export-file-name-prefix="商机导出"
				)
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="商机名称")
				el-table-column(prop="clientName" label="客户名称")
				el-table-column(prop="expectedAmount" label="预计成交金额")
					template(#default="{row}")
						span {{ formatMoney(row.expectedAmount) }}
				el-table-column(prop="ownerName" label="当前负责人" width="100")
				el-table-column(prop="expectedDealTimeText" label="预计成交日期")
				el-table-column(prop="nextContactTimeText" label="下次联系时间")
				el-table-column(prop="lastFollowTimeText" label="最后跟进时间")
				el-table-column(prop="stage" label="商机阶段" sortable)
					template(#default="{row}")
						el-tag(size="small" :type="statusObj[row.stage]?.tagType")  {{statusObj[row.stage]?.name}}
				el-table-column(prop="stageStayDays" label="阶段停留时长" width="110" )
					template(#default="{row}") {{row.stageStayDays}}天
				el-table-column(prop="createTimeText" label="创建时间")
				el-table-column(label="操作" width="220")
					template(#default="{row, $index}")
						.tab-link
							el-link(underline="never" type="primary" @click="toInfo(row)") 查看
							el-link(underline="never" type="primary" @click="toMd(row)") 编辑
							el-dropdown(placement="bottom-end" trigger="click" @command="command => handleCommand(command, row)")
								el-link(underline="never" type="primary") 更多
									el-icon
										ArrowDown
								template(#dropdown)
									el-dropdown-menu
										el-dropdown-item(v-for="opt in statusList" :key="opt.id" :command="`stage:${opt.id}`" :disabled="Number(row.stage) === Number(opt.id)") 设置为：{{opt.name}}
										el-dropdown-item(divided command="delete") 删除
		.panel-footer
			.total-section
				span 共 {{ pager.total }} 条记录
				span._sec 第 {{ pager.page }} / {{pager.pageCount}} 页
			el-pagination(v-model:current-page="pager.page",
				layout="prev, pager, next",
				:page-size="pager.rows",
				size="small",
				:total="pager.total",
				@current-change="handleCurrentChange",
				background)
</template>

<style scoped lang="scss">

</style>
