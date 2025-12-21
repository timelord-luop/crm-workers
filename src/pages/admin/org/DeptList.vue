<script setup>
import {onMounted, reactive, ref} from 'vue'
import {Notification, Plus, Search, RefreshLeft, Switch} from '@element-plus/icons-vue'
import {Vue3TreeOrg} from 'vue3-tree-org';
import "vue3-tree-org/lib/vue3-tree-org.css";
import {
	ApiDeptAdd,
	ApiDeptDelete,
	ApiDeptList,
	ApiDeptUpdate,
	ApiUserSimpleList
} from "@/configuration/api/users.js";
import Http from "@/plugins/http.js";
import {ElMessage, ElMessageBox} from "element-plus";
import CommonUtil from "@/assets/js/commonUtil.js";

const loading = ref(false);

const filter = reactive({
	name: '',
	type: 'tree'
});
const userList = ref([]);
const tableData = ref([]);
const baseTableData = ref([]);

const horizontal = ref(false);
const chartData = reactive({id: 0, pid: '0', name: '四海兄弟有限公司', children: []})

onMounted(() => {
	getBaseData();
})

const getUserList = () => {
	if (userList.value.length) return;
	Http.request(ApiUserSimpleList).then(res => {
		userList.value = res.list
	})
}
const resetFilter = () => {
	filter.name = '';
	getBaseData();
}
const getBaseData = () => {
	loading.value = true;
	const params = getParams();
	Http.request(ApiDeptList, params).then(res => {
		loading.value = false;
		baseTableData.value = res.list;
		tableData.value = res.list;
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}
const getParams = () => {
	return {
		type: filter.type
	};
}


// 新增、编辑部门
const dialogVisible = ref(false);
const formRef = ref();
const committing = ref(false);
const deptData = reactive({
	title: '',
	id: null,
	pid: null,
	parentName: '',
	name: '',
	principal: [],
	desc: ''
})
const rules = reactive({
	name: [{required: true, message: '请输入部门名称', trigger: 'change'}],
	// principal: [{required: true, message: '请选择部门负责人', trigger: 'change'}],
	pid: [{required: true, message: '请选择上级部门', trigger: 'change'}]
})
const toAdd = (row) => {
	getUserList();
	dialogVisible.value = true;
	deptData.title = '新增部门';
	deptData.id = null;
	deptData.pid = row ? row.id : null;
	deptData.parentName = row ? row.name : null;
	deptData.name = '';
	deptData.principal = [];
	deptData.desc = '';
}
const toEdit = (row) => {
	getUserList();
	dialogVisible.value = true;
	deptData.title = '编辑部门';
	deptData.id = row.id;
	deptData.pid = null;
	deptData.parentName = '';
	deptData.name = row.name;
	deptData.principal = row.principal ? row.principal.split(',') : [];
	deptData.desc = row.desc;
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return;
		committing.value = true;
		const API = deptData.id ? ApiDeptUpdate : ApiDeptAdd;
		if (deptData.principal.length) deptData.principal = deptData.principal.join(',')
		Http.request(API, deptData).then(res => {
			committing.value = false;
			dialogVisible.value = false;
			getBaseData();
		}).catch(err => {
			console.log(err);
			committing.value = false;
		})
	})
}

const toDelete = (row) => {
	ElMessageBox.confirm(`确定删除部门 “${row.name}” ?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		loading.value = true;
		Http.request(ApiDeptDelete, {id: row.id}).then(() => {
			ElMessage({
				type: 'success',
				showClose: true,
				message: `已删除部门：${row.name}`,
			})
			loading.value = false;
			getBaseData();
		}).catch(err => {
			console.log(err);
			loading.value = false;
		})
	}).catch(() => {})
}

// 组织架构图
const chartOrgVisible = ref(false);
const chartLoading = ref(false);
const showChartOrg = () => {
	chartLoading.value = true;
	chartOrgVisible.value = true
	Http.request(ApiDeptList, {type: 'list'}).then(res => {
		chartLoading.value = false;
		chartData.children = CommonUtil.arrayToChartTree(res.list);
		console.log(chartData.children, 'chartData.children')
	}).catch(err => {
		console.log(err);
		chartLoading.value = false;
	})
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
					placeholder="部门名称"
					@keyup.enter="toLocalSearch"
					@clear="getBaseData")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="toLocalSearch()") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter()") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toAdd()") 新增部门
				el-button(:icon="Notification" type="primary" plain, @click="showChartOrg()") 组织架构图
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border stripe, default-expand-all, row-key="id", height="100%")
				el-table-column(label="序号" width="54" align="center" type="index")
				el-table-column(prop="name" label="部门名称")
				el-table-column(prop="principalNames" label="负责人")
				el-table-column(prop="memberCount" label="人员数量")
				el-table-column(prop="desc" label="部门描述")
				el-table-column(prop="updateTime" label="更新时间")
				el-table-column(label="操作" width="230")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small" @click="toAdd(row)") 新增子部门
							el-button(plain size="small" @click="toEdit(row)") 编辑
							el-button(plain size="small" type="danger" :disabled="row.children.length > 0 || row.memberCount > 0" @click="toDelete(row)") 删除
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
			@submit.prevent
			label-width="auto"
		)
			el-form-item(label="上级部门" prop="pid" v-if="deptData.pid")
				el-input(v-model="deptData.parentName" disabled maxlength="32" placeholder="请输入" )
			el-form-item(label="部门名称" prop="name")
				el-input(v-model="deptData.name" maxlength="32" placeholder="请输入" )
			el-form-item(label="部门负责人")
				el-select(v-model="deptData.principal" multiple filterable placeholder="请选择" clearable)
					el-option(v-for="item in userList" :key="item.id" :label="item.name" :value="item.id")
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
		._chart_panel(v-loading="chartLoading")
			el-button._direction(:icon="Switch" plain @click="horizontal = !horizontal")
			vue3-tree-org(:data="chartData"
				collapsable,
				center,
				:horizontal="horizontal",
				:default-expand-level="5"
				:node-draggable="false"
				:toolBar="{scale: true, restore: false, expand: true, zoom: true, fullscreen: false}",
				:props="{id: 'id',label: 'name',children: 'children'}")
				template(v-slot="{node}")
					._chart_node
						span(:style="{color: node.pid ? 'var(--text-color)' : 'var(--secondary)'}") {{node.label}}
						._principal {{node.$$data.principalNames}}
</template>

<style scoped lang="scss">
._chart_panel {
	height: 100%;
	width: 100%;
	position: relative;
	._chart_node {
		padding: 6px 8px;
	}
	._principal {
		color: #f19914;
		font-size: 12px;
	}
	._direction {
		position: absolute;
		right: 10px;
		bottom: 150px;
		z-index: 1;
		padding: 6px 9px;
		border-radius: 0;
	}
}
:deep(.zm-tree-org) {
	padding: 0;
	background-color: var(--bg-color-main);
	overflow: hidden;
	.zm-tree-handle .zm-tree-handle-item {
		background-color: var(--bg-color-border);
		border: 1px solid var(--border);
	}
	.zoom-container {
		padding-top: 10px;
	}
	.tree-org-node__expand {
		background-color: var(--bg-color-main);
	}
	.tree-org-node__content .tree-org-node__inner {
		box-shadow: 0 1px 5px var(--border-shadow);
		white-space: nowrap;
	}
}
</style>
