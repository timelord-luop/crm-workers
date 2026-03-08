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
	{id: 1, name: "关于五金建材的咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '电话咨询', intention: '五金建材', status: 1, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "千里香旗舰店意向", client: '千里香旗舰店', phone: '13696445004', source: '渠道代理', intention: '五金建材', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '广州XX制造有限公司', phone: '13696445004', source: '客户推荐', intention: '防火门系列', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '线下活动', intention: '五金建材', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '其他', intention: '门窗系列', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '客户推荐', intention: '五金建材', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '其他', intention: '五金建材', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "地推咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '在线客服', intention: '五金建材', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '客户推荐', intention: '门窗系列', status: 1, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '线下活动', intention: '防火门系列', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '线下活动', intention: '防火门系列', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '线下活动', intention: '防火门系列', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '在线客服', intention: '五金建材', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '在线客服', intention: '防火门系列', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '客户推荐', intention: '五金建材', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '其他', intention: '五金建材', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "地推咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '在线客服', intention: '五金建材', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '客户推荐', intention: '门窗系列', status: 1, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '线下活动', intention: '防火门系列', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '线下活动', intention: '防火门系列', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '在线客服', intention: '五金建材', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "关于五金建材的咨询", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '在线客服', intention: '防火门系列', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
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
					placeholder="线索名称 / 客户 / 公司"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				el-select(v-model="filter.source" filterable placeholder="线索来源" @clear="getBaseData" clearable)
					el-option(v-for="item in sourceList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.intention" filterable placeholder="产品意向" @clear="getBaseData" clearable)
					el-option(v-for="item in intentionList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.status" filterable placeholder="线索状态" @clear="getBaseData" clearable)
					el-option(v-for="item in statusList" :key="item.id" :label="item.name" :value="item.name")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toMd") 新增线索
				el-button 导出
					el-icon(class="el-icon--right")
						Upload
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="线索名称")
				el-table-column(prop="client" label="客户 / 公司")
				el-table-column(prop="phone" label="联系电话")
				el-table-column(prop="source" label="线索来源")
				el-table-column(prop="intention" label="产品意向")
				el-table-column(prop="status" label="线索状态" width="100" sortable)
					template(#default="{row}")
						el-tag(size="small" :type="statusObj[row.status].tagType")  {{statusObj[row.status].name}}
				el-table-column(prop="principal" label="当前负责人" width="100")
				el-table-column(prop="nextTime" label="下次联系时间")
				el-table-column(prop="createTime" label="创建时间")
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
