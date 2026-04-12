<script setup>
import {onMounted, reactive, ref} from 'vue'
import {Search, RefreshLeft, ArrowDown} from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {
	ApiAccountAdd,
	ApiAccountDelete,
	ApiAccountList,
	ApiAccountUpdate,
	ApiAccountUpdateStatus
} from "@/configuration/api/common.js";

const loading = ref(false);

const filter = reactive({
	name: '',
	type: 'tree'
});
const tableData = ref([]);
const baseTableData = ref([]);

onMounted(() => {
	getBaseData();
})

const resetFilter = () => {
	filter.name = '';
	getBaseData();
}
const getBaseData = () => {
	loading.value = true;
	Http.request(ApiAccountList).then(res => {
		loading.value = false;
		baseTableData.value = res.list;
		tableData.value = res.list;
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}

// 新增、编辑账户
const dialogVisible = ref(false);
const formRef = ref();
const committing = ref(false);
const rowData = reactive({
	title: '',
	id: null,
	pid: null,
	code: '',
	name: '',
	periodMoney: null,
	remark: ''
})
const rules = reactive({
	name: [{required: true, message: '请输入账户名称', trigger: 'change'}],
	code: [{required: true, message: '请输入账户编码', trigger: 'change'}],
	pid: [{required: true, message: '请选择账户分类', trigger: 'change'}]
})
const toAdd = (row) => {
	dialogVisible.value = true;
	rowData.title = '新增账户';
	rowData.id = null;
	rowData.pid = row ? row.id : null;
	rowData.parentName = row ? row.name : null;
	rowData.name = '';
	rowData.code = '';
	rowData.periodMoney = null;
	rowData.remark = '';
}
const toEdit = (row) => {
	dialogVisible.value = true;
	rowData.title = '编辑账户';
	rowData.id = row.id;
	rowData.pid = null;
	rowData.parentName = '';
	rowData.name = row.name;
	rowData.code = row.code;
	rowData.periodMoney = row.periodMoney;
	rowData.remark = row.remark;
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return;
		const API = rowData.id ? ApiAccountUpdate : ApiAccountAdd;
		Http.request(API, rowData).then(res => {
			dialogVisible.value = false;
			getBaseData();
		}).finally(() => {
			committing.value = false;
		});
	})
}

const handleCommand = (command, row) => {
	if (command === 'delete') {
		ElMessageBox.confirm(`确定删除账户 “${row.name}” ?`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			loading.value = true;
			Http.request(ApiAccountDelete, {id: row.id}).then(() => {
				ElMessage({
					type: 'success',
					showClose: true,
					message: `已删除账户：${row.name}`,
				})
				getBaseData();
			}).finally(() => {
				loading.value = false;
			});
		}).catch(() => {})
	}
	if (command === 'status') {
		loading.value = true;
		const status = row.status === 1 ? 2 : 1;
		Http.request(ApiAccountUpdateStatus, {id: row.id, status: status}).then(() => {``
			row.status = status;
		}).finally(() => {
			loading.value = false;
		});
	}
}

// 搜索
const searchTreeData = (treeData, keyword, searchField = 'name', childrenField = 'children') => {
	if (!keyword || !keyword.trim()) {
		return treeData; // 空关键词返回原数据
	}
	const searchTerm = keyword.toLowerCase().trim();

	/**
	 * 递归搜索节点
	 * @param {Array} nodes 当前层节点数组
	 * @returns {Array} 过滤后的节点数组
	 */
	function searchNodes(nodes) {
		if (!nodes || !Array.isArray(nodes)) {
			return [];
		}

		const result = [];

		for (const node of nodes) {
			// 复制节点（浅拷贝，避免修改原数据）
			const newNode = { ...node };

			// 检查当前节点是否匹配
			const nodeName = String(node[searchField] || '').toLowerCase();
			const isMatch = nodeName.includes(searchTerm);

			// 递归搜索子节点
			let filteredChildren = [];
			if (node[childrenField] && node[childrenField].length > 0) {
				filteredChildren = searchNodes(node[childrenField]);
			}

			// 如果当前节点匹配或子节点有匹配的，则保留该节点
			if (isMatch || filteredChildren.length > 0) {
				// 如果当前节点匹配，可以高亮或标记匹配状态
				if (isMatch) {
					newNode.isMatch = true; // 标记匹配
					newNode.matchField = searchField; // 记录匹配字段
				}

				// 如果有过滤后的子节点，替换原children
				if (filteredChildren.length > 0) {
					newNode[childrenField] = filteredChildren;
					// 如果当前节点不匹配但有匹配的子节点，标记为展开节点
					if (!isMatch) {
						newNode.hasMatchedChildren = true;
					}
				} else {
					// 没有匹配的子节点，清空children
					newNode[childrenField] = [];
				}

				result.push(newNode);
			}
		}

		return result;
	}

	return searchNodes(treeData);
}
const toLocalSearch = () => {
	if (filter.name) {
		tableData.value = searchTreeData(baseTableData.value, filter.name)
	} else {
		getBaseData();
	}
}

</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(v-model="filter.name"
					clearable
					placeholder="账户名称 / 编码"
					@keyup.enter="toLocalSearch"
					@clear="getBaseData")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="toLocalSearch()") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter()") 重置
			.panel-extend
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border size="small" stripe, default-expand-all, row-key="id", height="100%")
				el-table-column(label="序号" width="54" align="center" type="index")
				el-table-column(prop="name" label="账户名称")
				el-table-column(prop="code" label="账户编码")
				el-table-column(prop="periodMoney" label="期初余额（元）")
				el-table-column(prop="remark" label="描述")
				el-table-column(prop="updateTime" label="账户状态" align="center" width="100")
					template(#default="{row}")
						el-tag(v-if="row.status === 1" size="small" type="success")  正常
						el-tag(v-if="row.status === 2" size="small" type="danger")  停用
				el-table-column(prop="updateTime" label="更新时间" width="140" )
				el-table-column(label="操作" width="140")
					template(#default="{row, $index}")
						.tab-link
							el-link(underline="never" type="success" v-if="row.level === 1" @click="toAdd(row)") 新增账户
							el-link(underline="never" type="primary" v-if="row.level !== 1" @click="toEdit(row)") 编辑
							el-dropdown(placement="bottom-end" v-if="row.level === 2" trigger="click" @command="command => handleCommand(command, row)")
								el-link(underline="never" type="primary") 更多
									el-icon
										ArrowDown
								template(#dropdown)
									el-dropdown-menu
										el-dropdown-item(command="status") {{row.status === 1 ? '停用' : '启用'}}
										el-dropdown-item(command="delete") 删除
	el-dialog(v-model="dialogVisible"
		width="460"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		:title="rowData.title")
		el-form(
			ref="formRef"
			:model="rowData"
			:rules="rules"
			@submit.prevent
			label-width="auto"
		)
			el-form-item(label="账户分类" prop="pid" v-if="rowData.pid")
				el-input(v-model="rowData.parentName" disabled maxlength="32" placeholder="请输入" )
			el-form-item(label="账户名称" prop="name")
				el-input(v-model="rowData.name" maxlength="32" placeholder="请输入" )
			el-form-item(label="账户编号" prop="code")
				el-input(v-model="rowData.code" maxlength="4" placeholder="请输入" )
			el-form-item(label="期初余额")
				el-input-number(
					style="width: 100%"
					:max="9999999999"
					placeholder="请输入"
					:value-on-clear="null"
					disabled-scientific,
					align="left"
					:controls="false"
					v-model="rowData.periodMoney"
				)
					template(#suffix) ￥
			el-form-item(label="描述")
				el-input(v-model="rowData.remark" type="textarea" maxlength="255" :rows="3" placeholder="请输入" )
		template(#footer)
			el-button(@click="dialogVisible = false") 取消
			el-button(type="primary" :loading="committing" @click="toCommit(formRef)") 保存
</template>

<style scoped lang="scss">

</style>
