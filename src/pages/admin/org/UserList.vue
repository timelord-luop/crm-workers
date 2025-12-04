<script setup>
import {ref, reactive, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import {Search, RefreshLeft, Plus, Upload} from '@element-plus/icons-vue'
import Http from "@/plugins/http.js";
import {ApiDeptSimpleList, ApiPostSimpleList, ApiUserList} from "@/configuration/api/users.js";

const router = useRouter()

const loading = ref(false);
const positionList = ref([]);
const deptList = ref([]);
const filter = reactive({
	conditions: '',
	positionId: '',
	deptId: '',
	date: []
});
const pager = reactive({
	page: 1,
	rows: 50,
	total: 0,
	pageCount: 0
});

const tableData = ref([]);

onMounted(() => {
	getPositionList();
	getDeptList();
	getBaseData();
})

const getPositionList = () => {
	Http.request(ApiPostSimpleList).then(res => {
		positionList.value = res.list
	})
}
const getDeptList = () => {
	Http.request(ApiDeptSimpleList).then(res => {
		deptList.value = res.list
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
	filter.positionId = '';
	filter.deptId = '';
	filter.date = [];
	getBaseData();
}
const getBaseData = () => {
	loading.value = true;
	const params = getParams();
	Http.request(ApiUserList, params).then(res => {
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
	if (filter.conditions) params.conditions = filter.conditions;
	if (filter.positionId) params.positionId = filter.positionId;
	if (filter.deptId) params.deptId = filter.deptId;
	if (filter.date) {
		params.dateBd = filter.date[0];
		params.dateEd = filter.date[1];
	}
	return params;
}
const toUserMd = (row) => {
	if (row) {
		router.push({
			path: '/user-md',
			query: {
				eid: row.id
			}
		})
	} else {
		router.push('/user-md')
	}
}
</script>

<template lang="pug">
	.list-container(v-loading="loading")
		.panel-header
			.panel-filter
				el-input(v-model="filter.conditions"
					clearable
					placeholder="姓名 / 手机号 / 工号"
					@keyup.enter="getBaseData"
					@clear="getBaseData")
				el-date-picker(v-model="filter.date"
					type="daterange"
					range-separator="至"
					start-placeholder="入职日期"
					value-format="X"
					@clear="getBaseData"
					end-placeholder="--")
				el-cascader(v-model="filter.deptId"
					:options="deptList"
					placeholder="部门"
					:props="{checkStrictly: true, emitPath: false, label: 'name', value: 'id'}"
					filterable,
					:show-all-levels="false"
					clearable)
				el-select(v-model="filter.positionId" filterable placeholder="职位" @clear="getBaseData" clearable)
					el-option(v-for="item in positionList" :key="item.id" :label="item.name" :value="item.id")
				.filter-btn
					el-button(:icon="Search" type="primary" @click="getBaseData") 查询
					el-button(:icon="RefreshLeft" @click="resetFilter") 重置
			.panel-extend
				el-button(:icon="Plus" type="success" plain, @click="toUserMd") 新增员工
				el-button 导出
					el-icon(class="el-icon--right")
						Upload
		.panel-body(style="min-height: 100px")
			el-table(:data="tableData" border stripe height="100%")
				el-table-column(type="expand")
					template(#default="{row}")
						el-row._table_extend(:gutter="30")
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 性别：
									span._val {{row.sex}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 办公电话：
									span._val {{row.officePhone}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 个人邮箱：
									span._val {{row.email}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 企业邮箱：
									span._val {{row.mailbox}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 紧急联系人：
									span._val {{row.exigencyUser}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 紧急联系人电话：
									span._val {{row.exigencyPhone}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 详细住址：
									span._val {{row.address}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 法律文书送达详细地址：
									span._val {{row.legalSendAddr}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 身份证号：
									span._val {{row.idCard}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 出生日期：
									span._val {{row.birthday}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 身份证到期日期：
									span._val {{row.idCardExpireDate}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 身份证详细地址：
									span._val {{row.idCardAddr}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 是否领取劳动合同：
									span._val(v-if="row.isContract === 1") 是
									span._val(v-if="row.isContract === 0") 否
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 合同起始日期：
									span._val {{row.contractBd}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 合同终止日期：
									span._val {{row.contractEd}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 签约单位：
									span._val {{row.contractCompany}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 参保单位：
									span._val {{row.insuredCompany}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 学历：
									span._val {{row.education}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 专业：
									span._val {{row.major}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 毕业学校：
									span._val {{row.school}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 毕业时间：
									span._val {{row.graduationDate}}
							el-col(:xs="24" :sm="12" :md="8" :lg="6" :xl="6")
								span._label 其他备注：
									span._val {{row.remark}}
						._table_tab(v-if="row.bankCards?.length")
							el-table(size="small" :data="row.bankCards")
								el-table-column(prop="account" label="银行账号")
								el-table-column(prop="userName" label="户名")
								el-table-column(prop="bankName" label="银行名称")
								el-table-column(prop="openingBank" label="开户行")
								el-table-column(prop="bankCode" label="行号")
								el-table-column(prop="remark" label="备注")
				el-table-column(label="序号" width="54" align="center")
					template(#default="{$index}") {{ (pager.rows * (pager.page - 1)) + $index + 1}}
				el-table-column(prop="name" label="姓名")
				el-table-column(prop="phone" label="手机号")
				el-table-column(prop="workNumber" label="工号")
				el-table-column(prop="deptName" label="所属部门")
				el-table-column(prop="positionName" label="职务")
				el-table-column(prop="boardDate" label="入职日期")
				el-table-column(label="操作" width="140")
					template(#default="{row, $index}")
						.tab-link
							el-button(plain size="small" @click="toUserMd(row)") 编辑
							el-dropdown(placement="bottom-end" trigger="click" style="margin-left: 8px")
								el-button(plain size="small") 更多
								template(#dropdown)
									el-dropdown-menu
										el-dropdown-item() 重置密码
										el-dropdown-item() 关闭账号
										el-dropdown-item() 离职办理
							//el-link(:icon="Edit" type="primary" underline="never" title="编辑")
							//el-link(:icon="View" type="primary" underline="never" title="详情")
		.panel-footer
			.total-section
				span 共 {{ pager.total }} 条记录
				span._sec 第 {{ pager.page }} / {{pager.pageCount}} 页
			el-pagination(v-model:current-page="pager.page",
				layout="prev, pager, next",
				:page-size="pager.rows",
				:total="pager.total",
				@current-change="handleCurrentChange",
				background)
</template>

<style scoped lang="scss">
._table_extend {
	padding: 5px 30px;
	margin-right: 0 !important;
	margin-left: 0 !important;
	background-color: var(--bg-color-border);
	._label {
		color: var(--secondary);
		line-height: 24px;
		._val {
			color: var(--text-color);
		}
	}
}
._table_tab {
	padding: 0 40px;
}
</style>
