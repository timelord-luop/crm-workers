<script setup>
import { ref, reactive } from 'vue'
import {Search, RefreshLeft, Plus, Upload, Download} from '@element-plus/icons-vue'

const filter = reactive({
	name: '',
	type: '',
	level: ''
});

const tableData = reactive([
	{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},{name: '王小二'},
]);

const currentPage = ref(1);
const handleSizeChange = (val) => {

}
const handleCurrentChange = (val) => {

}
</script>

<template lang="pug">
	.list-container
		.panel-filter
			el-input(v-model="filter.name" placeholder="客户名称" )
			el-select(v-model="filter.type" placeholder="客户来源" )
				el-option(label="线上推广" value="1")
				el-option(label="线下广告" value="2")
				el-option(label="其他" value="3")
			el-select(v-model="filter.type" placeholder="重要等级" )
				el-option(label="一星级" value="1")
				el-option(label="二星级" value="2")
				el-option(label="三星级" value="3")
				el-option(label="四星级" value="4")
				el-option(label="五星级" value="5")
			.filter-btn
				el-button(:icon="Search" type="primary") 查询
				el-button(:icon="RefreshLeft") 重置
		.panel-extend
			el-button(:icon="Plus" type="primary") 新增客户
			el-button(:icon="Download") 导入
			el-button 导出
				el-icon(class="el-icon--right")
					Upload
		.panel-body
			el-table(:data="tableData" border stripe height="100%" max-height="100%" )
				el-table-column(prop="name" label="序号" width="100")
				el-table-column(prop="name" label="客户名称")
				el-table-column(prop="name" label="客户来源")
				el-table-column(prop="name" label="联系方式")
				el-table-column(prop="name" label="重要等级")
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
