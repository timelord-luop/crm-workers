<script setup>
import { ref, reactive } from 'vue'
import {Search, RefreshLeft, Plus} from '@element-plus/icons-vue'

const filter = reactive({
	conditions: ''
});

const tableData = reactive([
	{name: '超级管理员', isAdmin: 1, memberNum: '2', desc: '--', updateTime: '2023-06-15 12:22'},
	{name: '运营负责人', isAdmin: 0, memberNum: '1', desc: '--', updateTime: '2023-06-15 12:22'},
	{name: '测试工程师', isAdmin: 0, memberNum: '2', desc: '--', updateTime: '2023-06-15 12:22'},
	{name: '开发工程师', isAdmin: 0, memberNum: '10', desc: '--', updateTime: '2023-06-15 12:22'},
	{name: '行政专员', isAdmin: 0, memberNum: '2', desc: '--', updateTime: '2023-06-15 12:22'},
	{name: '销售经理', isAdmin: 0, memberNum: '6', desc: '--', updateTime: '2023-06-15 12:22'},
	{name: '总账会计', isAdmin: 0, memberNum: '2', desc: '--', updateTime: '2023-06-15 12:22'},
	{name: '应收会计', isAdmin: 0, memberNum: '2', desc: '--', updateTime: '2023-06-15 12:22'}
]);

const currentPage = ref(1);
const handleSizeChange = (val) => {

}
const handleCurrentChange = (val) => {

}
// 新增、编辑职务
const dialogVisible = ref(false);
const formRef = ref();
const committing = ref(false);
const positionData = reactive({
	title: '',
	id: null,
	name: '',
	desc: ''
})
const rules = reactive({
	name: [{required: true, message: '请输入职务名称', trigger: 'change'}]
})
const toAdd = () => {
	dialogVisible.value = true;
	positionData.title = '新增职务';
	positionData.id = null;
	positionData.name = '';
	positionData.desc = '';
}
const toEdit = (row) => {
	dialogVisible.value = true;
	positionData.title = '编辑职务';
	positionData.id = row.id;
	positionData.name = row.name;
	positionData.desc = row.desc;
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return;
		committing.value = true;
		setTimeout(() => {
			committing.value = false;
			dialogVisible.value = false;
		}, 500)
	})
}
</script>

<template lang="pug">
	.list-container
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions" placeholder="职务名称" )
				.filter-btn
					el-button(:icon="Search" type="primary") 查询
					el-button(:icon="RefreshLeft") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toAdd()") 新增职务
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border stripe height="100%")
				el-table-column(label="序号" width="60" align="center" type="index")
				el-table-column(prop="name" label="职务名称")
				el-table-column(prop="memberNum" label="人员数量")
				el-table-column(prop="desc" label="职务描述")
				el-table-column(label="操作" width="140")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small" @click="toEdit(row)") 编辑
							el-button(plain size="small" type="danger") 删除
		.panel-footer
			.total-section
				span 共 {{ 10 }} 条记录
				span._sec 第 {{ currentPage }} / 50 页
			el-pagination(v-model:current-page="currentPage"
				:page-size="1"
				layout="prev, pager, next"
				:total="1"
				background,
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange")
				template(#default)
					span 共{{10}}条记录
	el-dialog(v-model="dialogVisible"
		width="460"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		:title="positionData.title")
		el-form(
			ref="formRef"
			:model="positionData"
			:rules="rules"
			label-width="auto"
		)
			el-form-item(label="职务名称" prop="name")
				el-input(v-model="positionData.name" maxlength="32" placeholder="请输入" )
			el-form-item(label="职务描述")
				el-input(v-model="positionData.desc" type="textarea" maxlength="255" :rows="3" placeholder="请输入" )
		template(#footer)
			el-button(@click="dialogVisible = false") 取消
			el-button(type="primary" :loading="committing" @click="toCommit(formRef)") 保存
</template>

<style scoped lang="scss">

</style>
