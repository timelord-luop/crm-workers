<script setup>
import {useRouter} from "vue-router";
import {onMounted, reactive, ref} from "vue";
import {Search, RefreshLeft, Plus, Upload} from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";

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
const filter = reactive({
	conditions: '',
	source: '',
	intention: '',
	status: ''
});
const pager = reactive({
	page: 1,
	rows: 50,
	total: 0,
	pageCount: 0
});
const tableData = ref([
	{id: 1, name: "002-工商银行0622", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '660.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-还贷款利息', source: '利息支出', out: '50.00', in: '', createTime: '2026-03-03 17:20'},
	{id: 1, name: "001-现金", date: '2026-03-02', client: '收-广州莱德机器制造有限公司（销售款）', source: '产品收入', in: '8,880.60', out: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "006-微信", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '660.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "002-工商银行0622", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '460.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '690.60', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '3,860.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "002-工商银行0622", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '660.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-还贷款利息', source: '利息支出', out: '50.00', in: '', createTime: '2026-03-03 17:20'},
	{id: 1, name: "001-现金", date: '2026-03-02', client: '收-广州莱德机器制造有限公司（销售款）', source: '产品收入', in: '8,880.60', out: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "006-微信", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '660.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "002-工商银行0622", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '460.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '690.60', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '3,860.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "002-工商银行0622", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '660.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-还贷款利息', source: '利息支出', out: '50.00', in: '', createTime: '2026-03-03 17:20'},
	{id: 1, name: "001-现金", date: '2026-03-02', client: '收-广州莱德机器制造有限公司（销售款）', source: '产品收入', in: '8,880.60', out: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "006-微信", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '660.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "002-工商银行0622", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '460.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '690.60', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "004-建设银行2232", date: '2026-03-02', client: '付-北京激光科技有限公司', source: '费用类', out: '3,860.00', in: '', createTime: '2026-03-02 11:11'},
	{id: 1, name: "001-现金", date: '2026-03-02', client: '收-广州莱德机器制造有限公司（销售款）', source: '产品收入', in: '8,880.60', out: '', createTime: '2026-03-02 11:11'},
]);

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
	filter.level = '';
	filter.classify = '';
	getBaseData();
}
const getBaseData = () => {

}

</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions"
					clearable
					placeholder="账户名称 / 摘要"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				el-date-picker(v-model="filter.date"
					type="daterange"
					range-separator="至"
					start-placeholder="出纳日期"
					value-format="X"
					@clear="getBaseData"
					end-placeholder="--")
				el-select(v-model="filter.intention" filterable placeholder="收支类别" @clear="getBaseData" clearable)
					el-option(v-for="item in intentionList" :key="item.id" :label="item.name" :value="item.name")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toMd") 新增日记账
				el-button 导出
					el-icon(class="el-icon--right")
						Upload
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="账户名称" width="200" )
				el-table-column(prop="date" label="出纳日期" width="130")
				el-table-column(prop="client" label="摘要")
				el-table-column(prop="in" label="借（收入）" width="120" align="right" header-align="center")
				el-table-column(prop="out" label="贷（支出）" width="120" align="right" header-align="center")
				el-table-column(prop="source" label="收支类别" width="140")
				el-table-column(prop="createTime" label="记账时间" width="140" )
				el-table-column(label="操作" width="140")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small" @click="toInfo(row)") 查看
							el-button(plain size="small" @click="toMd(row)") 编辑
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
