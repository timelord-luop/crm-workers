<script setup>
import { ref, reactive } from 'vue'
import {Search, RefreshLeft, Plus, Upload, Download, Edit, View} from '@element-plus/icons-vue'
import {useRouter} from "vue-router";

const router = useRouter()

const filter = reactive({
	name: '',
	type: '',
	level: ''
});

const tableData = reactive([
	{name: '四川飞鱼科技有限公司', source: '其他', phone: '0286363578', level: '五星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
	{name: '王大锤', source: '推广', phone: '136950045026', level: '二星级'},
]);

const currentPage = ref(1);
const handleSizeChange = (val) => {

}
const handleCurrentChange = (val) => {

}
const  handleClick = () => {

}
const toClientMd = (row) => {
	if (row) {
		router.push({
			path: '/client-md',
			query: {
				eid: row.phone
			}
		})
	} else {
		router.push('/client-md')
	}
}
</script>

<template lang="pug">
	.list-container
		.panel-header
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
				el-button(:icon="Plus" type="success" plain, @click="toClientMd()") 新增客户
				el-dropdown(split-button, trigger="click", @click="handleClick", style="margin-left: 10px")
					el-icon(class="el-icon--right")
						Upload
					span 导出
					template(#dropdown)
						el-dropdown-item(:icon="Download") 导入
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border stripe height="100%")
				el-table-column(label="序号" type="index" width="54" align="center" )
				el-table-column(prop="name" label="客户名称")
				el-table-column(prop="phone" label="联系方式")
				el-table-column(prop="source" label="客户来源")
				el-table-column(prop="level" label="重要等级")
				el-table-column(label="操作" width="140")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small") 查看
							el-button(plain size="small" @click="toClientMd(row)") 编辑
		.panel-footer
			.total-section
				span 共 {{ 100 }} 条记录
				span._sec 第 {{ currentPage }} / 50 页
			el-pagination(v-model:current-page="currentPage"
				:page-size="100"
				layout="prev, pager, next"
				:total="1000"
				size="small"
				background,
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange")
				template(#default)
					span 共{{100}}条记录
</template>

<style scoped lang="scss">

</style>
