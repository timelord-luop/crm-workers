<script setup>
import {useRouter} from "vue-router";
import {computed, onMounted, reactive, ref} from "vue";
import {Search, RefreshLeft, Plus, ArrowDown} from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";
import {ApiLeadsConvert, ApiLeadsDelete, ApiLeadsExport, ApiLeadsQueryList, ApiLeadsUpdateStatus} from "@/configuration/api/leads.js";
import {ElMessage, ElMessageBox} from "element-plus";
import ExportImport from "@/components/ExportImport.vue";

const router = useRouter()

const loading = ref(false);
const sourceList = ref([]);
const intentionList = ref([]);
const statusObj = {
	"1": {id: 1, name: '新录入', tagType: 'danger'},
	"2": {id: 2, name: '跟进中', tagType: 'warning'},
	"3": {id: 3, name: '已转化', tagType: 'success'},
	"4": {id: 4, name: '已流失', tagType: 'info'}
}
const statusList = ref(Object.values(statusObj));

/** DB INTEGER：秒或毫秒 → 展示用毫秒 */
const toDisplayMs = (val) => {
	if (val == null || val === '') return null
	const n = Number(val)
	if (!Number.isFinite(n)) return null
	return n > 1e12 ? n : n * 1000
}

const formatDbDate = (val) => {
	const ms = toDisplayMs(val)
	if (ms == null) return '-'
	const d = new Date(ms)
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

const formatDbDateTime = (val) => {
	const ms = toDisplayMs(val)
	return ms == null ? '-' : new Date(ms).toLocaleString('zh-CN', {hour12: false})
}

const filter = reactive({
	conditions: '',
	source: '',
	productIntent: '',
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
	{key: 'name', name: '线索名称'},
	{key: 'clientName', name: '客户/公司'},
	{key: 'contactName', name: '联系人'},
	{key: 'contactPhone', name: '联系电话'},
	{key: 'source', name: '线索来源'},
	{key: 'productIntent', name: '产品意向'},
	{key: 'statusName', name: '线索状态'},
	{key: 'isConvertedName', name: '是否已转化'},
	{key: 'ownerName', name: '当前负责人'},
	{key: 'nextContactTimeText', name: '下次联系'},
	{key: 'createTimeText', name: '创建时间'}
]

const leadsExportParams = computed(() => {
	const params = getParams();
	delete params.page;
	delete params.rows;
	return params;
})

onMounted(() => {
	getDictList();
	getBaseData();
})
const getDictList = () => {
	const params = {
		dictKey: ['LEADS_SOURCE', 'PRODUCT_INTENTION']
	};
	Http.request(ApiSysDictionaryRows, params).then(res => {
		sourceList.value = res.list.filter(item => item.dictKey === 'LEADS_SOURCE');
		intentionList.value = res.list.filter(item => item.dictKey === 'PRODUCT_INTENTION');
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
	filter.source = '';
	filter.productIntent = '';
	filter.status = '';
	pager.page = 1;
	getBaseData();
}
const getBaseData = () => {
	loading.value = true;
	const params = getParams();
	Http.request(ApiLeadsQueryList, params).then(res => {
		loading.value = false;
		pager.total = res.total;
		pager.pageCount = res.pageCount;
		tableData.value = res.list;
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}

const getParams = () => {
	let params = {
		page: pager.page,
		rows: pager.rows
	}
	if (filter.conditions) params.conditions = filter.conditions;
	if (filter.source) params.source = filter.source;
	if (filter.productIntent) params.productIntent = filter.productIntent;
	if (filter.status !== '' && filter.status != null) params.status = filter.status;
	return params;
}

const handleCommand = (command, row) => {
	if (command === 'delete') {
		ElMessageBox.confirm(`确定删除线索 “${row.name}” ?`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			loading.value = true;
			Http.request(ApiLeadsDelete, {id: row.id}).then(() => {
				ElMessage({
					type: 'success',
					showClose: true,
					message: `已删除线索：${row.name}`,
				})
				loading.value = false;
				getBaseData();
			}).catch(err => {
				console.log(err);
				loading.value = false;
			})
		}).catch(() => {})
	}
	if (String(command || '').startsWith('status:')) {
		const status = Number(String(command).split(':')[1]);
		if (!status) return;
		if (status === 4) {
			ElMessageBox.prompt('请输入流失原因', '设置线索为流失', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputType: 'textarea',
				inputPlaceholder: '请输入流失原因',
				inputValidator: (val) => !!String(val || '').trim() || '流失原因不能为空'
			}).then(({value}) => {
				loading.value = true;
				Http.request(ApiLeadsUpdateStatus, {id: row.id, status, loseReason: String(value || '').trim()}).then(() => {
					row.status = status;
					row.loseReason = String(value || '').trim();
				}).finally(() => {
					loading.value = false;
				})
			}).catch(() => {})
		} else {
			loading.value = true;
			Http.request(ApiLeadsUpdateStatus, {id: row.id, status}).then(() => {
				row.status = status;
				row.loseReason = '';
			}).catch(err => {
				console.log(err);
			}).finally(() => {
				loading.value = false;
			})
		}
	}
	if (command === 'convert') {
		loading.value = true;
		Http.request(ApiLeadsConvert, {id: row.id}).then((res) => {
			ElMessage({
				type: 'success',
				showClose: true,
				message: res.msg || '线索已转化为商机'
			});
			getBaseData();
		}).catch(err => {
			console.log(err);
			loading.value = false;
		}).finally(() => {
			loading.value = false;
		});
	}
}

const toMd = (row) => {
	if (row) {
		router.push({
			path: '/leads-md',
			query: {
				eid: row.id
			}
		})
	} else {
		router.push('/leads-md')
	}
}

const toInfo = (row) => {
	router.push({
		path: '/leads-md',
		query: {
			eid: row.id,
			mode: 'info'
		}
	})
}

</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions"
					clearable
					placeholder="线索名称 / 客户公司 / 联系人 / 电话"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				el-select(v-model="filter.source" filterable placeholder="线索来源" @clear="getBaseData" clearable)
					el-option(v-for="item in sourceList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.productIntent" filterable placeholder="产品意向" @clear="getBaseData" clearable)
					el-option(v-for="item in intentionList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.status" filterable placeholder="线索状态" @clear="getBaseData" clearable)
					el-option(v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toMd") 新增线索
				export-import(
					:excel-field="excelField"
					:export-api="ApiLeadsExport"
					:export-params="leadsExportParams"
					export-file-name-prefix="线索导出"
				)
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="线索名称" min-width="120")
				el-table-column(prop="clientName" label="客户 / 公司" min-width="120")
				el-table-column(prop="contactName" label="联系人" width="100")
				el-table-column(prop="contactPhone" label="联系电话" width="120")
				el-table-column(prop="source" label="线索来源" width="100")
				el-table-column(prop="productIntent" label="产品意向" min-width="100")
				el-table-column(prop="status" label="线索状态" width="100" sortable)
					template(#default="{row}")
						el-tag(size="small" :type="statusObj[String(row.status)]?.tagType")  {{statusObj[String(row.status)]?.name || '-'}}
				el-table-column(label="已转化" width="80" align="center")
					template(#default="{row}")
						el-tag(size="small" :type="Number(row.isConverted) === 1 ? 'success' : 'info'") {{ Number(row.isConverted) === 1 ? '是' : '否' }}
				el-table-column(prop="ownerId" label="当前负责人" width="110")
					template(#default="{row}") {{ row.ownerName || row.ownerId || '-' }}
				el-table-column(label="下次联系" width="110")
					template(#default="{row}") {{ formatDbDate(row.nextContactTime) }}
				el-table-column(label="创建时间" width="155")
					template(#default="{row}") {{ formatDbDateTime(row.createTime) }}
				el-table-column(label="操作" width="220" fixed="right")
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
										el-dropdown-item(command="convert" :disabled="Number(row.isConverted) === 1 || Number(row.status) === 4") 转为商机
										el-dropdown-item(v-for="opt in statusList" :key="opt.id" :command="`status:${opt.id}`" :disabled="Number(row.status) === Number(opt.id)") 设置为：{{opt.name}}
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
