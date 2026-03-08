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
	{id: 1, name: "FK202603001", typeName: '采购付款', client: '北京激光科技有限公司', nature: '限期付款', account: '002-工商银行0622', money: '3,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603002", typeName: '往来付款', client: '成都飞鱼星科技有限责任公司', nature: '限期付款', account: '002-工商银行0622', money: '3,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603003", typeName: '其他付款', client: '北京激光科技有限公司', nature: '限期付款', account: '002-工商银行0622', money: '660.50', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603006", typeName: '采购退款', client: '云南香格里拉云雾大酒店', nature: '月结', account: '002-工商银行0622', money: '360.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603008", typeName: '差旅付款', client: '北京激光科技有限公司', nature: '限期付款', account: '005-农业银行5608', money: '3,660.90', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603009", typeName: '往来付款', client: '北京XX科技有限公司', nature: '预付款', account: '006-微信', money: '3,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603012", typeName: '往来付款', client: '千里香旗舰店', nature: '限期付款', account: '007-支付宝', money: '1,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603022", typeName: '销售付款', client: '广州XX制造有限公司', nature: '全额付款', account: '003-中国银行1230', money: '4,660.20', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603002", typeName: '往来付款', client: '成都飞鱼星科技有限责任公司', nature: '限期付款', account: '002-工商银行0622', money: '3,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603003", typeName: '其他付款', client: '北京激光科技有限公司', nature: '限期付款', account: '002-工商银行0622', money: '660.50', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603006", typeName: '采购退款', client: '云南香格里拉云雾大酒店', nature: '月结', account: '002-工商银行0622', money: '360.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603008", typeName: '差旅付款', client: '北京激光科技有限公司', nature: '限期付款', account: '005-农业银行5608', money: '3,660.90', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603009", typeName: '往来付款', client: '北京XX科技有限公司', nature: '预付款', account: '006-微信', money: '3,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603012", typeName: '往来付款', client: '千里香旗舰店', nature: '限期付款', account: '007-支付宝', money: '1,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603022", typeName: '销售付款', client: '广州XX制造有限公司', nature: '全额付款', account: '003-中国银行1230', money: '4,660.20', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603002", typeName: '往来付款', client: '成都飞鱼星科技有限责任公司', nature: '限期付款', account: '002-工商银行0622', money: '3,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603003", typeName: '其他付款', client: '北京激光科技有限公司', nature: '限期付款', account: '002-工商银行0622', money: '660.50', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603006", typeName: '采购退款', client: '云南香格里拉云雾大酒店', nature: '月结', account: '002-工商银行0622', money: '360.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603008", typeName: '差旅付款', client: '北京激光科技有限公司', nature: '限期付款', account: '005-农业银行5608', money: '3,660.90', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603009", typeName: '往来付款', client: '北京XX科技有限公司', nature: '预付款', account: '006-微信', money: '3,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603012", typeName: '往来付款', client: '千里香旗舰店', nature: '限期付款', account: '007-支付宝', money: '1,660.00', userName: '徐三', createTime: '2026-03-02 11:11'},
	{id: 1, name: "FK202603022", typeName: '销售付款', client: '广州XX制造有限公司', nature: '全额付款', account: '003-中国银行1230', money: '4,660.20', userName: '徐三', createTime: '2026-03-02 11:11'},
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
					placeholder="付款单号"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				el-select(v-model="filter.intention" filterable placeholder="付款类型" @clear="getBaseData" clearable)
					el-option(v-for="item in intentionList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.intention" filterable placeholder="付款性质" @clear="getBaseData" clearable)
					el-option(v-for="item in intentionList" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.intention" filterable placeholder="付款账户" @clear="getBaseData" clearable)
					el-option(v-for="item in intentionList" :key="item.id" :label="item.name" :value="item.name")
				el-date-picker(v-model="filter.date"
					type="daterange"
					range-separator="至"
					start-placeholder="付款日期"
					value-format="X"
					@clear="getBaseData"
					end-placeholder="--")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button 导出
					el-icon(class="el-icon--right")
						Upload
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="付款单号" width="160" )
				el-table-column(prop="typeName" label="付款类型" width="130")
				el-table-column(prop="client" label="客户")
				el-table-column(prop="money" label="付款金额" width="140" align="right" header-align="center")
				el-table-column(prop="nature" label="付款性质" width="130")
				el-table-column(prop="account" label="付款账户")
				el-table-column(prop="userName" label="付款人" width="130")
				el-table-column(prop="createTime" label="付款日期" width="140" )
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
