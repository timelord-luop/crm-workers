<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import {Search, RefreshLeft, Plus, Upload, ArrowDown} from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";
import {ApiSupplierDelete, ApiSupplierQueryList, ApiSupplierImport, ApiSupplierExport, ApiSupplierUpdateStatus} from "@/configuration/api/supplier.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";
import {ElMessage, ElMessageBox} from "element-plus";
import ExportImport from "@/components/ExportImport.vue";

const router = useRouter()

const loading = ref(false);
const classifyList = ref([]);
const levelList = ref([]);
const filter = reactive({
	conditions: '',
	level: '',
	classify: ''
});
const pager = reactive({
	page: 1,
	rows: 50,
	total: 0,
	pageCount: 0
});
const tableData = ref([]);

onMounted(() => {
	getDictList();
	getBaseData();
})
const getDictList = () => {
	const params = {
		dictKey: ['SUPPLIER_CLASSIFY', 'SUPPLIER_LEVEL']
	};
	Http.request(ApiSysDictionaryRows, params).then(res => {
		classifyList.value = res.list.filter(item => item.dictKey === 'SUPPLIER_CLASSIFY');
		levelList.value = res.list.filter(item => item.dictKey === 'SUPPLIER_LEVEL');
	})
}
const currentPage = ref(1);
const handleSizeChange = (val) => {
	getBaseData();
}
const handleCurrentChange = (val) => {
	getBaseData();
}
const resetFilter = () => {
	filter.conditions = '';
	filter.level = '';
	filter.classify = '';
	getBaseData();
}
const getBaseData = () => {
	loading.value = true;
	const params = getParams();
	Http.request(ApiSupplierQueryList, params).then(res => {
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
	if (filter.level) params.level = filter.level;
	if (filter.classify) params.classify = filter.classify;
	return params;
}
const toMd = (row) => {
	if (row) {
		router.push({
			path: '/supplier-md',
			query: {
				eid: row.id
			}
		})
	} else {
		router.push('/supplier-md')
	}
}
const handleCommand = (command, row) => {
	if (command === 'delete') {
		ElMessageBox.confirm(`确定删除供应商 “${row.name}” ?`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			loading.value = true;
			Http.request(ApiSupplierDelete, {id: row.id}).then(() => {
				ElMessage({
					type: 'success',
					showClose: true,
					message: `已删除供应商：${row.name}`,
				})
				loading.value = false;
				getBaseData();
			}).catch(err => {
				console.log(err);
				loading.value = false;
			})
		}).catch(() => {})
	}
	if (command === 'status') {
		loading.value = true;
		const status = row.status === 1 ? 2 : 1;
		Http.request(ApiSupplierUpdateStatus, {id: row.id, status: status}).then(() => {
			loading.value = false;
			row.status = status;
		}).catch(err => {
			console.log(err);
			loading.value = false;
		})
	}
}
const toInfo = (row) => {

}

const excelField = [
	{key: 'name', name: '供应商名称'},
	{key: 'code', name: '编号'},
	{key: 'classify', name: '供应商类别'},
	{key: 'level', name: '供应商等级'},
	{key: 'contactName', name: '联系人'},
	{key: 'contactPhone', name: '联系人手机号'},
	{key: 'areaText', name: '所在地区'},
	{key: 'statusName', name: '状态'}
]

/** 导出：与列表筛选一致，放大 rows 拉取当前筛选下的数据 */
const supplierExportParams = computed(() => {
	const params = getParams();
	delete params.page;
	delete params.rows;
	return params
})

const onImport = () => {
	getBaseData()
}

</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions"
					clearable
					placeholder="供应商名称 / 编号"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				el-select(v-model="filter.classify" filterable placeholder="供应商类别" @clear="getBaseData" clearable)
					el-option(v-for="item in classifyList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.level" filterable placeholder="供应商等级" @clear="getBaseData" clearable)
					el-option(v-for="item in levelList" :key="item.id" :label="item.name" :value="item.name")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toMd") 新增供应商
				export-import(
					is-import
					:excel-field="excelField"
					:export-api="ApiSupplierExport"
					:import-api="ApiSupplierImport"
					:export-params="supplierExportParams"
					export-file-name-prefix="供应商导出"
					template-file-name="供应商导入模板.xlsx"
					dialog-title="导入供应商"
					@import-success="onImport"
				)
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="供应商名称")
				el-table-column(prop="code" label="编号")
				el-table-column(prop="classify" label="供应商类别")
				el-table-column(prop="level" label="供应商等级")
				el-table-column(prop="contactName" label="联系人")
				el-table-column(prop="contactPhone" label="联系人手机号")
				el-table-column(prop="areaText" label="所在地区")
				el-table-column(prop="status" label="状态" width="100")
					template(#default="{row}")
						el-tag(v-if="row.status === 1" size="small" type="success")  正常
						el-tag(v-if="row.status === 2" size="small" type="danger")  停用
				el-table-column(label="操作" width="160")
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
										el-dropdown-item(command="status") {{row.status === 1 ? '停用' : '启用'}}
										el-dropdown-item(command="delete") 删除
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
