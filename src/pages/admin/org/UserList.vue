<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {Search, RefreshLeft, Plus, Upload} from '@element-plus/icons-vue'

const router = useRouter()

const filter = reactive({
	conditions: '',
	date: ''
});

const tableData = reactive([
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '张衡', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '陈大斯', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '吴奇', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王可二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '罗币地', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '吴奇', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王可二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '罗币地', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
	{name: '王小二', phone: '13696445008', workNum: '52001', deptName: '客服服务部', positionName: '客服经理', boardDate: '2023-06-15'},
]);

const currentPage = ref(1);
const handleSizeChange = (val) => {

}
const handleCurrentChange = (val) => {

}
const toUserMd = (row) => {
	if (row) {
		router.push({
			path: '/user-md',
			query: {
				eid: row.phone
			}
		})
	} else {
		router.push('/user-md')
	}
}
</script>

<template lang="pug">
	.list-container
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions" placeholder="姓名 / 手机号 / 工号" )
				el-date-picker(v-model="filter.date"
					type="daterange"
					range-separator="至"
					start-placeholder="入职日期"
					end-placeholder="--")
				.filter-btn
					el-button(:icon="Search" type="primary") 查询
					el-button(:icon="RefreshLeft") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toUserMd()") 新增员工
				el-button 导出
					el-icon(class="el-icon--right")
						Upload
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border stripe height="100%")
				el-table-column(label="序号" width="60" align="center" type="index")
				el-table-column(prop="name" label="姓名")
				el-table-column(prop="phone" label="手机号")
				el-table-column(prop="workNum" label="工号")
				el-table-column(prop="deptName" label="所属部门")
				el-table-column(prop="positionName" label="职务")
				el-table-column(prop="boardDate" label="入职日期")
				el-table-column(label="操作" width="200")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small") 查看
							el-button(plain size="small" @click="toUserMd(row)") 编辑
							el-dropdown(placement="bottom-end" trigger="click" style="margin-left: 8px")
								el-button(plain size="small") 更多
								template(#dropdown)
									el-dropdown-menu
										el-dropdown-item() 重置密码
										el-dropdown-item() 关闭账号
										el-dropdown-item() 离职办理
							//el-link(:icon="Edit" type="primary" underline="never" title="编辑")
							//el-link(:icon="View" type="primary" underline="never" title="详情")
		.panel-footer
			.total-section
				span 共 {{ 100 }} 条记录
				span._sec 第 {{ currentPage }} / 50 页
			el-pagination(v-model:current-page="currentPage"
				:page-size="100"
				layout="prev, pager, next"
				:total="1000"
				background,
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange")
				template(#default)
					span 共{{100}}条记录
</template>

<style scoped lang="scss">

</style>
