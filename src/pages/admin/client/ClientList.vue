<script setup>
import {ref, reactive, onMounted, nextTick, computed} from 'vue'
import {Search, RefreshLeft, Plus, Upload, Download, Setting, Close, Sort} from '@element-plus/icons-vue'
import {useRouter} from "vue-router";
import Http from "@/plugins/http.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";
import {ApiDeptList} from "@/configuration/api/users.js";
import CommonUtil from "@/assets/js/commonUtil.js";
import {
	ApiClientCustomFiledSetHead,
	ApiClientQueryList
} from "@/configuration/api/client.js";
import draggable from 'vuedraggable';
import ClientInfoDrawer from "@/pages/admin/client/comp/ClientInfoDrawer.vue";

const router = useRouter()

const loading = ref(false);
const typeOptions = ref([]);
const sourceOptions = ref([]);
const industryOptions = ref([]);
const userOptions = ref([]);
const filter = reactive({
	conditions: '',
	type: '',
	source: '',
	industry: '',
	principal: ''
});
const pager = reactive({
	page: 1,
	rows: 50,
	total: 0,
	pageCount: 0
});
const tableData = ref([]);

onMounted( async () => {
	getDictList();
	getUserList();
	getBaseData();
})

const getDictList = () => {
	const params = {
		dictKey: ['CLIENT_TYPE', 'CLIENT_SOURCE', 'CLIENT_INDUSTRY']
	};
	Http.request(ApiSysDictionaryRows, params).then(res => {
		typeOptions.value = res.list.filter(item => item.dictKey === 'CLIENT_TYPE');
		sourceOptions.value = res.list.filter(item => item.dictKey === 'CLIENT_SOURCE');
		industryOptions.value = res.list.filter(item => item.dictKey === 'CLIENT_INDUSTRY');
	})
}
const getUserList = () => {
	Http.request(ApiDeptList, {type: 'list'}).then(res => {
		userOptions.value = CommonUtil.arrayToChartTree(res.list);
	}).catch(err => {
		console.log(err);
	})
}

const currentPage = ref(1);
const handleSizeChange = (val) => {
	getBaseData();
}
const handleCurrentChange = (val) => {
	getBaseData();
}
const resetFilter = () => {
	filter.conditions = '';
	filter.type = '';
	filter.source = '';
	filter.industry = '';
	filter.principal = '';
	getBaseData();
}
const  handleClick = () => {

}

const getBaseData = () => {
	loading.value = true;
	const params = getParams();
	Http.request(ApiClientQueryList, params).then(res => {
		loading.value = false;
		pager.total = res.total;
		pager.pageCount = res.pageCount;
		parseTableData(res.list);
		if (res.fields?.length) {
			let shows = []; // isFilter
			let noShows = [];
			res.fields.forEach(item => {
				item.isFilter = false;
				if (item.isShow === 1) shows.push(item)
				if (item.isShow === 2) noShows.push(item)
			})
			headerFields.all = res.fields;
			headerFields.shows = shows;
			headerFields.noShows = noShows;
		}
	}).catch(err => {
		console.log(err);
		loading.value = false;
	})
}

const parseTableData = (list) => {
	let resList = [];
	list.forEach(item => {
		if (item.customFields) {
			item.customFields = JSON.parse(item.customFields);
		}
		const flattened = Object.assign({}, item, item.customFields)
		delete flattened.customFields;
		resList.push(flattened)
	})
	tableData.value = resList;
}

const getParams = () => {
	let params = {
		page: pager.page,
		rows: pager.rows
	}
	if (filter.conditions) params.conditions = filter.conditions;
	if (filter.type) params.type = filter.type;
	if (filter.source) params.source = filter.source;
	if (filter.industry) params.industry = filter.industry;
	if (filter.principal) params.principal = filter.principal;
	return params;
}
const toClientMd = (row) => {
	if (row) {
		router.push({
			path: '/client-md',
			query: {
				eid: row.id
			}
		})
	} else {
		router.push('/client-md')
	}
}
/*  ---- 表头设置 ----  */
const defShow = ref(true);
const settingRef = ref();
const popoverRef = ref();
const headerSearchVal = ref('');
const headerFields = reactive({
	all: [],
	shows: [],
	noShows: []
})
const headerInput = (val) => {
	headerFields.shows.forEach(item => {
		if (val) {
			item.isFilter = item.name.includes(val)
		} else {
			item.isFilter = false
		}
	})
	headerFields.noShows.forEach(item => {
		if (val) {
			item.isFilter = item.name.includes(val)
		} else {
			item.isFilter = false
		}
	})
}
const onShowChange = async (val, item) => {
	await nextTick();
	if (val === 1) {
		headerFields.shows.push(item)
		let findIdx = headerFields.noShows.findIndex(field => field.id === item.id);
		if (findIdx !== -1) headerFields.noShows.splice(findIdx, 1)
	} else {
		headerFields.noShows.push(item)
		let findIdx = headerFields.shows.findIndex(field => field.id === item.id);
		if (findIdx !== -1) headerFields.shows.splice(findIdx, 1)
	}
	const params = {
		id: item.id,
		isShow: val,
		headerSort: headerFields.shows.length + 1,
		// headerSort: val === 1 ? headerFields.shows.length + 1 : null
	}
	Http.request(ApiClientCustomFiledSetHead, params).then(() => {})
}
const onFieldDragEnd = (event) => {
	let inShows = headerFields.shows.map((item, index) => {
		return {
			id: item.id,
			headerSort: headerSearchVal.value ? item.headerSort:  index + 1
		}
	})
	if (headerSearchVal.value) {
		let originalValues = inShows.map(item => item.headerSort).sort((a, b) => a - b);

		inShows.forEach((item, index) => {
			item.headerSort = originalValues[index];
		});
	}
	Http.request(ApiClientCustomFiledSetHead, inShows).then(() => {})
}
// 详情
const tableRef = ref();
const drawerVisible = ref(false);
const rowId = ref('');
const pageIds = computed(() => {
	return tableData.value.map(item => item.id)
})
const showInfo = (row) => {
	tableRef.value.setCurrentRow(row)
	drawerVisible.value = true
	rowId.value = row.id;
}
const onInfoPage = (index) => {
	let rowData = tableData.value[index];
	tableRef.value.setCurrentRow(rowData)
	rowId.value = rowData.id;
}
</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions"
					clearable
					placeholder="客户名称 / 编号"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				el-select(v-model="filter.type" filterable placeholder="客户类型" @clear="getBaseData" clearable)
					el-option(v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.name")
				el-select(v-model="filter.source" filterable placeholder="客户来源" @clear="getBaseData" clearable)
					el-option(v-for="item in sourceOptions" :key="item.id" :label="item.name" :value="item.name")
				el-cascader(v-model="filter.principal"
					placeholder="负责人"
					:options="userOptions"
					:show-all-levels="false"
					:props="{label: 'name', value: 'id', emitPath: false}",
					filterable)
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toClientMd()") 新增客户
				el-dropdown(split-button, trigger="click", @click="handleClick", style="margin-left: 6px")
					el-icon(class="el-icon--right")
						Upload
					span 导出
					template(#dropdown)
						el-dropdown-item(:icon="Download") 导入
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" ref="tableRef" highlight-current-row border size="small" stripe show-overflow-tooltip height="100%")
				el-table-column(label="序号" type="index" width="54" align="center" fixed="left")
				el-table-column(prop="name" label="客户名称" width="200" fixed="left")
					template(#default="{row}")
						el-link(underline="never", type="primary" @click="showInfo(row)") {{row.name}}
				el-table-column(prop="code" label="客户编号")
				template(v-for="col in headerFields.shows" :key="col.id")
					el-table-column(:prop="col.key" :label="col.name")
				el-table-column(label="操作" width="80" fixed="right")
					template(#header)
						.table-head-custom
							span 操作
							el-link(ref="settingRef" :icon="Setting" type="info" underline="never")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small" @click="toClientMd(row)") 编辑
		.panel-footer
			.total-section
				span 共 {{ pager.total }} 条记录
				span._sec 第 {{ pager.page }} / {{pager.pageCount}} 页
			el-pagination(v-model:current-page="pager.page",
				layout="prev, pager, next",
				:page-size="pager.rows",
				size="small",
				:total="pager.total",
				@current-change="handleCurrentChange",
				background)
		el-popover(
			ref="popoverRef"
			:virtual-ref="settingRef"
			trigger="click"
			:popper-style="{padding: '10px 0'}"
			width="240"
			:hide-after="0"
			placement="bottom-end"
			virtual-triggering
		)
			.tab-head-conf
				._header
					._title
						span 表头设置
						el-link(:icon="Close" @click="popoverRef.hide()" underline="never")
					._search
						el-input(v-model="headerSearchVal" @input="headerInput" clearable :prefix-icon="Search")
				._content
					._cut 显示字段
					ul
						li
							._text
								el-link(disabled :icon="Sort" type="info" underline="never")
								span 客户名称
							._switch
								el-switch(v-model="defShow" size="small" disabled)
						li
							._text
								el-link(disabled :icon="Sort" type="info" underline="never")
								span 客户编号
							._switch
								el-switch(v-model="defShow" size="small" disabled)
						draggable(item-key="id"
							v-model="headerFields.shows"
							handle=".handle"
							:filter="'.no-drag'"
							@end="onFieldDragEnd"
							:animation="200")
							template(#item="{ element }")
								li(:key="element.id")
									._text
										el-link(:class="element.disabled ? 'no-drag' : 'handle'" :icon="Sort" type="info" underline="never")
										span(:class="element.isFilter ? '_filter' : ''") {{element.name}}
									._switch
										el-switch(v-model="element.isShow"
											size="small"
											:active-value="1"
											:inactive-value="2"
											@change="val => onShowChange(val, element)")
					._cut 未显示字段
					ul(v-if="headerFields.noShows.length")
						li(v-for="item in headerFields.noShows")
							._text
								span(:class="item.isFilter ? '_filter' : ''") {{item.name}}
							._switch
								el-switch(v-model="item.isShow"
									:active-value="1"
									:inactive-value="2"
									@change="val => onShowChange(val, item)"
									size="small")
					._empty(v-else) 暂无字段
		client-info-drawer(v-model:visible="drawerVisible"
			:id="rowId",
			:page-ids="pageIds",
			:custom-fields="headerFields.all"
			@info-page="onInfoPage")
</template>

<style scoped lang="scss">
.el-popover {
	padding: 10px 0 !important;
}
.tab-head-conf {
	display: flex;
	flex-direction: column;
	max-height: 520px;
	._header {
		padding: 0 12px;
		._title {
			display: flex;
			justify-content: space-between;
			padding-bottom: 6px;
			border-bottom: 1px solid var(--border);
			.el-link {
				font-size: 16px;
			}
		}
		._search {
			margin-top: 10px;
		}
	}
	._content {
		flex: 1;
		overflow-y: auto;
		margin-top: 4px;
		padding: 0 14px;
		._cut {
			color: var(--secondary);
			margin-top: 8px;
			margin-bottom: 4px;
		}
		._empty {
			margin: 10px 0;
			color: var(--secondary);
		}
		li {
			display: flex;
			justify-content: space-between;
			line-height: 34px;
			align-items: center;
			padding: 0 4px;
			border-radius: 3px;
			&:hover {
				background-color: var(--bg-color-mute);
			}
			._text {
				font-size: 14px;
				display: flex;
				.el-link {
					font-size: 14px;
					margin-right: 10px;
				}
				._filter {
					color: var(--el-color-success);
				}
			}
			._switch {
				display: flex;
			}
		}
	}
}
</style>
