<script setup>
import {nextTick, onMounted, reactive, ref} from "vue";
import FieldDialog from "@/components/FieldDialog.vue";
import {Sort} from '@element-plus/icons-vue'
import CommonUtil from "@/assets/js/commonUtil.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {
	ApiClientCustomFiledAdd,
	ApiClientCustomFiledDelete,
	ApiClientCustomFiledList, ApiClientCustomFiledSort, ApiClientCustomFiledStatus,
	ApiClientCustomFiledUpdate
} from "@/configuration/api/client.js";
import Http from "@/plugins/http.js";
import Sortable from "sortablejs";
import {ApiSysConfRows, ApiSysConfUpdate} from "@/configuration/api/common.js";

// tab切换
const activeName = ref('field')
const loading = ref(false)
const tabHandleChange = (tab) => {
	activeName.value = tab;
	if (tab === 'field') {
		if (!tableData.value.length) {
			getFieldData();
		}
	}
	if (tab === 'other') {
		if (!sysConf.value.length) {
			getSysConf();
		}
	}
}
const tableRef = ref();
const tableData = ref([])
const areaOptions = ref([]);
const dialogVisible = ref(false)

const fieldData = ref({});
onMounted(async () => {
	getFieldData();
	areaOptions.value = await CommonUtil.getAreaOptions(0);
	console.log(areaOptions.value)
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
	loading.value = true;
	const data  = CommonUtil.deepClone(tableData.value);
	const params = data.map((item, index) => {
		return {
			id: item.id,
			sort: (index + 1) * 100
		}
	})
	Http.request(ApiClientCustomFiledSort, {data: params}).then(res => {
		getFieldData();
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
const getFieldData = () => {
	loading.value = true;
	Http.request(ApiClientCustomFiledList).then(res => {
		loading.value = false;
		tableData.value = res.list.map(item => {
			return {
				...item,
				optionsText: item.options.map(opt => opt.val).join('，')
			}
		});
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
const add = (index) => {
	fieldData.value = {
		index: index || null,
		sort: index >= 0 ? (index + 1) * 100 + 1 : (tableData.value.length + 1) * 100,
		name: '',
		fieldType: 2,
		textType: 1,
		unit: '',
		multiple: 1,
		placeholder: '',
		options: []
	}
	dialogVisible.value = true
}
const edit = (data, index) => {
	fieldData.value = {
		id: data.id,
		index: index,
		sort: data.sort,
		name: data.name,
		fieldType: data.fieldType,
		textType: data.textType,
		unit: data.unit,
		multiple: data.multiple,
		placeholder: data.placeholder,
		options: data.options,
	}
	dialogVisible.value = true
}
const toDelete = (row) => {
	ElMessageBox.confirm(`确定删除字段 “${row.name}” ?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		loading.value = true;
		Http.request(ApiClientCustomFiledDelete, {id: row.id}).then(() => {
			ElMessage({
				type: 'success',
				showClose: true,
				message: `已删除字段：${row.name}`,
			})
			loading.value = false;
			getFieldData();
		})
	}).catch(() => {})
}
const fieldDataChange = (data) => {
	let resData = CommonUtil.deepClone(data);
	loading.value = true;
	const API = data.id ? ApiClientCustomFiledUpdate : ApiClientCustomFiledAdd;
	resData.options = JSON.stringify(data.options)
	Http.request(API, resData).then(() => {
		loading.value = false;
		dialogVisible.value = false;
		getFieldData();
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
const handleCommand = (command, row) => {
	if (command === 'delete') {
		toDelete(row);
	}
	if (command === 'status') {
		loading.value = true;
		const status = row.status === 1 ? 2 : 1;
		Http.request(ApiClientCustomFiledStatus, {id: row.id, status: status}).then(() => {
			// loading.value = false;
			getFieldData();
		}).catch(err => {
			console.log(err);
			loading.value = false;
		})
	}
}
/*
* 其他设置
* */
const sysConf = ref([]);
const otherData = reactive({
	areaFlag: '1', // 是否地区统计
	areaDefault: '0'// 默认地区
})
const getSysConf = () => {
	loading.value = true;
	Http.request(ApiSysConfRows, {keys: ['areaFlag', 'areaDefault']}).then(res => {
		loading.value = false;
		sysConf.value = res.list;
		res.list.forEach(item => {
			otherData[item.key] = item.value;
		})
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
const toSaveConf = () => {
	const params = sysConf.value.map(item => {
		return {
			id: item.id,
			value: otherData[item.key]
		}
	});
	loading.value = true;
	Http.request(ApiSysConfUpdate, {data: params}).then(() => {
		ElMessage({
			type: 'success',
			showClose: true,
			message: '保存成功！',
		})
		loading.value = false;
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
</script>

<template lang="pug">
	.custom-container
		el-tabs(tab-position="left" style="height: 100%" v-model="activeName" @tab-change="tabHandleChange")
			el-tab-pane(label="自定义字段" name="field")
				el-table(:data="tableData" ref="tableRef" border stripe height="100%" row-key="id"  v-loading="loading")
					template(#empty)
						el-link(type="success" @click="add") 添加字段
					el-table-column(label="序号" width="54" type="index" align="center")
					el-table-column(prop="name" label="字段名称" width="140" )
					el-table-column(prop="fieldType" label="字段类型" width="140" )
						template(#default="{row}")
							span(v-if="row.fieldType === 1") 文本
								span(v-if="row.textType === 1") （单行文本）
								span(v-if="row.textType === 2") （多行文本）
								span(v-if="row.textType === 3") （数字）
								span(v-if="row.textType === 4") （金额）
							span(v-if="row.fieldType === 2") 选项
								span(v-if="row.multiple === 1") （单选）
								span(v-if="row.multiple === 2") （多选）
					el-table-column(prop="placeholder" label="输入提示")
					el-table-column(prop="optionsText" label="选项值")
					el-table-column(prop="sort" label="排序" align="center" width="80")
						template(#default="{row}")
							el-link.drag-handle(type="info" :icon="Sort" underline="never")
					el-table-column(prop="status" label="状态" align="center" width="80")
						template(#default="{row}")
							el-tag(v-if="row.status === 1" size="small" type="success")  正常
							el-tag(v-if="row.status === 2" size="small" type="danger")  停用
					el-table-column(prop="updateTime" width="130" label="更新时间")
					el-table-column(label="操作" width="200")
						template(#default="{row, $index}")
							.tab-link
								el-button(text bg size="small" type="success" @click="add($index)") 添加
								el-button(text bg size="small" @click="edit(row, $index)") 编辑
								el-dropdown(placement="bottom-end" trigger="click" @command="command => handleCommand(command, row)" style="margin-left: 8px")
									el-button(plain size="small") 更多
									template(#dropdown)
										el-dropdown-menu
											el-dropdown-item(command="status") {{row.status === 1 ? '停用' : '启用'}}
											el-dropdown-item(command="delete") 删除
			el-tab-pane(label="其他设置" name="other")
				el-form._other_form(
					v-loading="loading"
					ref="formRef"
					:model="otherData"
					@submit.prevent
					label-width="auto"
				)
					el-form-item(label="是否按地区统计:" prop="areaFlag")
						el-switch(v-model="otherData.areaFlag" inline-prompt active-text="是" inactive-text="否" active-value="1" inactive-value="2")
					el-form-item(label="默认地区:" prop="areaDefault")
						el-cascader(v-model="otherData.areaDefault"
							ref="areaRef"
							style="width: 320px"
							:options="areaOptions"
							:props="{showPrefix: false, checkStrictly: true, checkOnClickNode: true, emitPath: false}",
							filterable,
							clearable)
					el-form-item(label=" ")
						el-button(type="primary" @click="toSaveConf") 保 存
	field-dialog(v-model:visible="dialogVisible" :field-data="fieldData" @confirm="fieldDataChange")
</template>

<style scoped lang="scss">
.custom-container {
	background-color: var(--bg-color-main);
	height: 100%;
	margin-top: 10px;
	border-radius: 14px;
	padding: 30px 20px;
	box-sizing: border-box;
}
:deep(.el-tabs__nav-wrap:after) {
	background-color: var(--bg-color-mute);
}
:deep(.el-tabs--left .el-tabs__header.is-left) {
	margin-right: 20px;
}
._other_form {
	width: 80%;
	margin: auto;
}
</style>
