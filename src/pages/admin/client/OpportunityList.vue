<script setup>
import {useRouter} from "vue-router";
import {onMounted, reactive, ref} from "vue";
import {Search, RefreshLeft, Plus, Upload} from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";
import {ApiDeptList} from "@/configuration/api/users.js";
import CommonUtil from "@/assets/js/commonUtil.js";

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
	{id: 1, name: "ERP系统采购项目", client: '北京XX科技有限公司', phone: '13696445004', source: '电话咨询', intention: '2026-03-20', status: 1, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "千里香旗舰店意向", client: '千里香旗舰店', phone: '13696445004', source: '渠道代理', intention: '2026-03-20', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '广州XX制造有限公司', phone: '13696445004', source: '客户推荐', intention: '2026-03-11', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '线下活动', intention: '2026-03-20', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '北京XX科技有限公司', phone: '13696445004', source: '其他', intention: '2026-03-11', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '客户推荐', intention: '2026-03-20', status: 5, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '北京XX科技有限公司', phone: '13696445004', source: '其他', intention: '2026-03-20', status: 6, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "地推咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '在线客服', intention: '2026-03-20', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '客户推荐', intention: '2026-03-11', status: 1, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '线下活动', intention: '2026-03-11', status: 5, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '北京XX科技有限公司', phone: '13696445004', source: '线下活动', intention: '2026-03-11', status: 6, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '北京XX科技有限公司', phone: '13696445004', source: '线下活动', intention: '2026-03-11', status: 6, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '在线客服', intention: '2026-03-20', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '在线客服', intention: '2026-03-11', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '客户推荐', intention: '2026-03-20', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '北京XX科技有限公司', phone: '13696445004', source: '其他', intention: '2026-03-20', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "地推咨询", client: '北京XX科技有限公司', phone: '13696445004', source: '在线客服', intention: '2026-03-20', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '客户推荐', intention: '2026-03-11', status: 1, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '线下活动', intention: '2026-03-11', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '北京XX科技有限公司', phone: '13696445004', source: '线下活动', intention: '2026-03-11', status: 2, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '成都飞鱼科技有限公司', phone: '13696445004', source: '在线客服', intention: '2026-03-20', status: 3, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
	{id: 1, name: "ERP系统采购项目", client: '云南香格里拉云雾大酒店', phone: '13696445004', source: '在线客服', intention: '2026-03-11', status: 4, principal: '徐三', nextTime: '2026-03-11', createTime: '2026-03-02 11:11'},
]);

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
					el-option(v-for="item in statusList" :key="item.id" :label="item.name" :value="item.name")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toMd") 新增商机
				el-button 导出
					el-icon(class="el-icon--right")
						Upload
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="商机名称")
				el-table-column(prop="client" label="客户名称")
				el-table-column(prop="phone" label="预计成交金额")
					template(#default="{row}")
						span 50,000.00
				el-table-column(prop="principal" label="当前负责人" width="100")
				el-table-column(prop="intention" label="预计成交日期")
				el-table-column(prop="nextTime" label="下次联系时间")
				el-table-column(prop="intention" label="最后跟进时间")
				el-table-column(prop="status" label="商机阶段" sortable)
					template(#default="{row}")
						el-tag(size="small" :type="statusObj[row.status].tagType")  {{statusObj[row.status].name}}
				el-table-column(prop="intention" label="阶段停留时长" width="110" )
					template(#default="{row}") 12天
				el-table-column(prop="createTime" label="创建时间")
				el-table-column(label="操作" width="140")
					template(#default="{row, $index}")
						.tab-link
							el-link(underline="never" type="primary" @click="toInfo(row)") 查看
							el-link(underline="never" type="primary" @click="toMd(row)") 编辑
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
