<script setup>
import {ref, reactive, onMounted} from 'vue'
import {Search, RefreshLeft, Plus} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import Http from "@/plugins/http.js";
import {ApiPostAdd, ApiPostDelete, ApiPostQueryList, ApiPostUpdate} from "@/configuration/api/users.js";

const loading = ref(false);

const filter = reactive({
	name: '',
	orderBy: '',
	sort: ''
});
const pager = reactive({
	page: 1,
	rows: 50,
	total: 0,
	pageCount: 0
});

const tableData = ref([]);

onMounted(() => {
	getBaseData();
})

const handleCurrentChange = (val) => {
	getBaseData();
}

const resetFilter = () => {
	filter.name = '';
	getBaseData();
}
const getBaseData = () => {
	loading.value = true;
	const params = getParams();
	Http.request(ApiPostQueryList, params).then(res => {
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
	if (filter.name) params.name = filter.name;
	return params;
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
		const API = positionData.id ? ApiPostUpdate : ApiPostAdd;
		Http.request(API, positionData).then(res => {
			committing.value = false;
			dialogVisible.value = false;
			getBaseData();
		}).catch(err => {
			console.log(err);
			committing.value = false;
		})
	})
}

// 删除职务
const toDelete = (row) => {
	ElMessageBox.confirm(`确定删除职务 “${row.name}” ?`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			loading.value = true;
			Http.request(ApiPostDelete, {id: row.id}).then(() => {
				ElMessage({
					type: 'success',
					showClose: true,
					message: `已删除职位：${row.name}`,
				})
				loading.value = false;
				getBaseData();
			}).catch(err => {
				console.log(err);
				loading.value = false;
			})
		}).catch(() => {})
}
</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(v-model="filter.name"
					clearable
					placeholder="职务名称"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toAdd") 新增职务
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border stripe height="100%")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="职务名称")
				el-table-column(prop="memberCount" label="人员数量" sortable)
				el-table-column(prop="desc" label="职务描述")
				el-table-column(label="操作" width="140")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small" @click="toEdit(row)") 编辑
							el-button(plain size="small" type="danger" :disabled="row.memberCount > 0" @click="toDelete(row)") 删除
		.panel-footer
			.total-section
				span 共 {{ pager.total }} 条记录
				span._sec 第 {{ pager.page }} / {{pager.pageCount}} 页
			el-pagination(v-model:current-page="pager.page",
				layout="prev, pager, next",
				:page-size="pager.rows",
				size="small"
				:total="pager.total",
				@current-change="handleCurrentChange",
				background)
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
			@submit.prevent
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
