<script setup>
import { ref, reactive } from 'vue'
import {Notification, Plus} from '@element-plus/icons-vue'
import {Vue3TreeOrg} from 'vue3-tree-org';
import "vue3-tree-org/lib/vue3-tree-org.css";

const filter = reactive({
	conditions: '',
	date: ''
});

const tableData = reactive([
	{id: 1, name: '总经办', principal: '王梦', principalIds: [4], memberNum: '168', desc: '总经办..', updateTime: '2023-06-15 12:22', children: [

			{id: 4, name: '业务部', principal: '钱小二', principalIds: [3], memberNum: '30', desc: '销售、客服', updateTime: '2023-06-15 10:22', children: [
					{id: 5, name: '销售1部', principal: '罗大都', principalIds: [1, 2], memberNum: '5', desc: '', updateTime: '2023-06-15 10:22'},
					{id: 6, name: '销售2部', principal: '罗大都', principalIds: [1, 3], memberNum: '5', desc: '', updateTime: '2023-06-15 10:22'},
					{id: 7, name: '销售3部', principal: '罗大都', principalIds: [ 3], memberNum: '5', desc: '', updateTime: '2023-06-15 10:22'},
					{id: 8, name: '客服服务部', principal: '罗大都', principalIds: [1], memberNum: '5', desc: '', updateTime: '2023-06-15 10:22'},
					{id: 9, name: '工程部', principal: '罗大都', principalIds: [3], memberNum: '5', desc: '', updateTime: '2023-06-15 10:22'}
				]},
			{id: 2, name: '行政部', principal: '李华,赵霞', principalIds: [4], memberNum: '10', desc: '行政人事..', updateTime: '2023-06-15 10:22'},
			{id: 3, name: '财务部', principal: '罗大都', principalIds: [1, 3], memberNum: '5', desc: '', updateTime: '2023-06-15 10:22'}
		]},
]);

const chartData = reactive({id: 0, name: '四海兄弟有限公司', children: []})

// 新增、编辑部门
const dialogVisible = ref(false);
const formRef = ref();
const committing = ref(false);
const deptData = reactive({
	title: '',
	id: null,
	parentId: null,
	parentName: '',
	name: '',
	principalIds: [],
	desc: ''
})
const rules = reactive({
	name: [{required: true, message: '请输入部门名称', trigger: 'change'}],
	principalIds: [{required: true, message: '请选择部门负责人', trigger: 'change'}],
	parentId: [{required: true, message: '请选择上级部门', trigger: 'change'}]
})
const toAdd = (row) => {
	dialogVisible.value = true;
	deptData.title = '新增部门';
	deptData.id = null;
	deptData.parentId = row ? row.id : null;
	deptData.parentName = row ? row.name : null;
	deptData.name = '';
	deptData.principalIds = [];
	deptData.desc = '';
}
const toEdit = (row) => {
	dialogVisible.value = true;
	deptData.title = '编辑部门';
	deptData.id = row.id;
	deptData.parentId = null;
	deptData.parentName = '';
	deptData.name = row.name;
	deptData.principalIds = row.principalIds;
	deptData.desc = row.desc;
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

// 组织架构图
const chartOrgVisible = ref(false);
const showChartOrg = () => {
	chartData.children = tableData;
	chartOrgVisible.value = true
}

</script>

<template lang="pug">
	.list-container
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions" placeholder="部门名称" )
				.filter-btn
					el-button(:icon="Search" type="primary") 查询
					el-button(:icon="RefreshLeft") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toAdd()") 新增部门
				el-button(:icon="Notification" type="primary" plain, @click="showChartOrg()") 组织架构图
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border stripe, default-expand-all, row-key="id", height="100%")
				el-table-column(label="序号" width="60" align="center" type="index")
				el-table-column(prop="name" label="部门名称")
				el-table-column(prop="principal" label="负责人")
				el-table-column(prop="memberNum" label="人员数量")
				el-table-column(prop="desc" label="部门描述")
				el-table-column(prop="updateTime" label="更新时间")
				el-table-column(label="操作" width="230")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small" @click="toAdd(row)") 新增子部门
							el-button(plain size="small" @click="toEdit(row)") 编辑
							el-button(plain size="small" type="danger") 删除
	el-dialog(v-model="dialogVisible"
		width="460"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		:title="deptData.title")
		el-form(
			ref="formRef"
			:model="deptData"
			:rules="rules"
			label-width="auto"
		)
			el-form-item(label="上级部门" prop="parentId" v-if="deptData.parentId")
				el-input(v-model="deptData.parentName" disabled maxlength="32" placeholder="请输入" )
			el-form-item(label="部门名称" prop="name")
				el-input(v-model="deptData.name" maxlength="32" placeholder="请输入" )
			el-form-item(label="部门负责人" prop="principalIds")
				el-select(v-model="deptData.principalIds" multiple placeholder="请选择")
					el-option(label="王晓" :value="1")
					el-option(label="陈金德" :value="2")
					el-option(label="黄天霸" :value="3")
					el-option(label="吴梦" :value="4")
			el-form-item(label="部门描述")
				el-input(v-model="deptData.desc" type="textarea" maxlength="255" :rows="3" placeholder="请输入" )
		template(#footer)
			el-button(@click="dialogVisible = false") 取消
			el-button(type="primary" :loading="committing" @click="toCommit(formRef)") 保存
	el-dialog(v-model="chartOrgVisible"
		class="_chart_dialog"
		fullscreen
		draggable
		destroy-on-close
		title="组织架构图")
		._chart_panel
			vue3-tree-org(:data="chartData"
				collapsable,
				center,
				:default-expand-level="5"
				:toolBar="{scale: true, restore: false, expand: true, zoom: true, fullscreen: false}",
				:props="{id: 'id',label: 'name',children: 'children'}")
</template>

<style scoped lang="scss">
._chart_panel {
	height: 100%;
	width: 100%;
}
</style>
