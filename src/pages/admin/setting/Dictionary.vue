<script setup>
import {nextTick, onMounted, reactive, ref} from "vue";
import {Sort} from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import {
	ApiSysDictionaryAdd,
	ApiSysDictionaryALl, ApiSysDictionaryDelete,
	ApiSysDictionaryRow, ApiSysDictionarySort,
	ApiSysDictionaryUpdate
} from "@/configuration/api/common.js";
import Http from "@/plugins/http.js";
import {ElMessage, ElMessageBox} from "element-plus";
import CommonUtil from "@/assets/js/commonUtil.js";

const loading = ref(false);
const listLoading = ref(false);
const treeRef = ref();
const treeData = ref([])
const currentData = ref({})
const filter = reactive({
	name: ''
});
const tableRef = ref();
const tableData = ref([]);
onMounted(async () => {
	getBaseData();
	await nextTick();
	const tbody = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody')

	Sortable.create(tbody, {
		animation: 150,
		handle: '.drag-handle',
		onEnd(event) {
			const oldIndex = event.oldIndex
			const newIndex = event.newIndex
			// 交换数组数据
			const movedItem = tableData.value.splice(oldIndex, 1)[0]
			tableData.value.splice(newIndex, 0, movedItem)
			updateSortData();
		}
	})
})

const updateSortData = () => {
	listLoading.value = true;
	const data  = CommonUtil.deepClone(tableData.value);
	data.forEach((item, index) => item.sort = index + 1)
	Http.request(ApiSysDictionarySort, {data: data}).then(res => {
		getDictData();
	}).catch(err => {
		console.log(err);
		listLoading.value = false;
	})
}
const getBaseData = () => {
	loading.value = true;
	Http.request(ApiSysDictionaryALl).then(res => {
		loading.value = false;
		treeData.value = res.list;
		if (res?.list.length) {
			currentData.value = res.list[0].children[0];
			getDictData();
		}
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
const resetFilter = () => {
	filter.name = '';
	getDictData();
}
const getDictData = () => {
	listLoading.value = true;
	const params = {
		dictId: currentData.value.id
	}
	if (filter.name) params.name = filter.name;
	Http.request(ApiSysDictionaryRow, params).then(res => {
		listLoading.value = false;
		tableData.value = res.list;
	}).catch(err => {
		console.log(err);
		listLoading.value = false;
	})
}
const handleNodeClick = (data, node) => {
	if (node.level === 1) {
		return false;
	}
	if (currentData.value.id !== data.id) {
		currentData.value = data;
		getDictData();
	}
};
// 新增、编辑字典
const dialogVisible = ref(false);
const formRef = ref();
const committing = ref(false);
const optionData = reactive({
	title: '',
	id: null,
	dictId: null,
	dictKey: '',
	name: '',
	sort: '',
	remark: ''
})
const rules = reactive({
	dictId: [{required: true, message: '请选择字典类型', trigger: 'change'}],
	name: [{required: true, message: '请输入字典项名称', trigger: 'change'}],
})
const toAdd = () => {
	dialogVisible.value = true;
	optionData.title = '新增字典项';
	optionData.id = null;
	optionData.dictId = currentData.value.id;
	optionData.dictKey = currentData.value.keyword;
	optionData.name = '';
	optionData.sort = tableData.value.length + 1;
	optionData.remark = '';
}
const toEdit = (row) => {
	dialogVisible.value = true;
	optionData.title = '编辑字典项';
	optionData.id = row.id;
	optionData.dictId = row.dictId;
	optionData.dictKey = row.keyword;
	optionData.name = row.name;
	optionData.sort = row.sort;
	optionData.remark = row.remark;
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return;
		committing.value = true;
		const API = optionData.id ? ApiSysDictionaryUpdate : ApiSysDictionaryAdd;
		Http.request(API, optionData).then(res => {
			committing.value = false;
			dialogVisible.value = false;
			getDictData();
		}).catch(err => {
			console.log(err);
			committing.value = false;
		})
	})
}
// 删除字典
const toDelete = (row) => {
	ElMessageBox.confirm(`确定删除字典项 “${row.name}” ?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		listLoading.value = true;
		Http.request(ApiSysDictionaryDelete, {id: row.id}).then(() => {
			ElMessage({
				type: 'success',
				showClose: true,
				message: `已删除字典项：${row.name}`,
			})
			listLoading.value = false;
			getDictData();
		}).catch(err => {
			console.log(err);
			listLoading.value = false;
		})
	}).catch(() => {})
}
</script>

<template lang="pug">
	.cate-panel(v-loading="loading")
		.cate-container
			.cate-title 字典类型
			.cate-body
				el-tree(ref="treeRef"
					class="no-root-highlight",
					:data="treeData"
					default-expand-all,
					node-key="id"
					highlight-current,
					:props="{label: 'name', disabled: 'disabled'}"
					:current-node-key="currentData.id"
					@node-click="handleNodeClick")
		.list-container(v-loading="listLoading")
			.panel-header
				.panel-filter
					el-input(v-model="filter.name"
						clearable
						placeholder="字典项"
						@keyup.enter="getDictData"
						@clear="getDictData")
					.filter-btn
						el-button(:icon="Search" type="primary" @click="getDictData") 查询
						el-button(:icon="RefreshLeft" @click="resetFilter") 重置
				.panel-extend
					el-button(:icon="Plus" type="success" plain, @click="toAdd") 新增字典项
			.panel-body(style="min-height: 100px")
				el-table(:data="tableData" border size="small" stripe ref="tableRef" row-key="id" height="100%")
					el-table-column(label="序号" width="54" type="index" align="center")
					el-table-column(prop="name" label="字典项")
					el-table-column(label="字典类型")
						template(#default="{row}") {{currentData.name}}
					el-table-column(prop="updateTime" label="更新时间")
					el-table-column(prop="remark" label="备注")
					el-table-column(prop="sort" label="排序" align="center" width="80")
						template(#default="{row}")
							el-link.drag-handle(type="info" :icon="Sort" underline="never")
					el-table-column(label="操作" width="140")
						template(#default="{row, $index}")
							.tab-link
								el-link(underline="never" type="primary" @click="toEdit(row)") 编辑
								el-link(underline="never" type="danger" :disabled="row.memberCount > 0" @click="toDelete(row)") 删除
	el-dialog(v-model="dialogVisible"
		width="460"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		:title="optionData.title")
		el-form(
			ref="formRef"
			:model="optionData"
			:rules="rules"
			@submit.prevent
			label-width="auto"
		)
			el-form-item(label="字典类型" prop="dictId")
				el-input(:value="currentData.name" disabled)
			el-form-item(label="字典项" prop="name")
				el-input(v-model="optionData.name" maxlength="32" placeholder="请输入" )
			el-form-item(label="排序")
				el-input-number(v-model="optionData.sort" :min="1" :max="200")
			el-form-item(label="备注")
				el-input(v-model="optionData.remark" type="textarea" maxlength="255" :rows="3" placeholder="请输入" )
		template(#footer)
			el-button(@click="dialogVisible = false") 取消
			el-button(type="primary" :loading="committing" @click="toCommit(formRef)") 保存
</template>

<style scoped lang="scss">

</style>
