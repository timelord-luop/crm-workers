<script setup>
import { ArrowRightBold, ArrowUp, ArrowDown, MoreFilled, Plus } from '@element-plus/icons-vue';
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import Http from '@/plugins/http.js';
import {
	ApiClientInfo,
	ApiClientFollowList,
	ApiClientFollowAdd,
	ApiClientFollowLatest,
	ApiClientFollowLatestEdit,
	ApiOperationLogList
} from '@/configuration/api/client.js';
import {
	ApiReceiptQueryList,
	ApiPaymentQueryList,
	ApiReceiptOptions,
	ApiPaymentOptions,
	ApiReceiptAdd,
	ApiPaymentAdd
} from '@/configuration/api/finance.js';
import Editor from '@/components/Editor.vue';
import FinanceDetailDialog from '@/pages/admin/finance/comp/FinanceDetailDialog.vue';

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	id: String,
	pageIds: {
		type: Array,
		default: () => []
	},
	customFields: {
		type: Array,
		default: () => []
	}
});

const emit = defineEmits(['update:visible', 'infoPage']);

const dialogVisible = computed({
	get: () => props.visible,
	set: (val) => emit('update:visible', val)
});

const prevDisabled = computed(() => props.pageIds.indexOf(props.id) === 0);
const nextDisabled = computed(() => props.pageIds.indexOf(props.id) === props.pageIds.length - 1);

const pageLoading = ref(false);
const followLoading = ref(false);
const latestLoading = ref(false);
const logLoading = ref(false);
const submittingFollow = ref(false);
const savingLatest = ref(false);

const infoData = ref({});
const activeTab = ref('follow');

const followList = ref([]);
const selectedFollow = ref(null);
const selectedFollowId = ref('');
const followPager = ref({ page: 1, rows: 10, total: 0, pageCount: 0 });

const receiptList = ref([]);
const paymentList = ref([]);
const operationLogList = ref([]);
const selectedReceiptId = ref('');
const selectedPaymentId = ref('');
const selectedFinanceRow = ref(null);
const selectedFinanceKind = ref('receipt');
const financeDetailVisible = ref(false);

const receiptPager = ref({ page: 1, rows: 8, total: 0 });
const paymentPager = ref({ page: 1, rows: 8, total: 0 });
const logPager = ref({ page: 1, rows: 10, total: 0 });

const financeDialogVisible = ref(false);
const financeCommitting = ref(false);
const financeKind = ref('receipt');
const financeFormRef = ref();
const financeTypeList = ref([]);
const financeNatureList = ref([]);
const financeCategoryList = ref([]);
const financeAccountList = ref([]);
const financeUserList = ref([]);
const financeForm = reactive({
	typeName: '',
	nature: '',
	category: '',
	accountId: '',
	amount: null,
	dateTime: '',
	handlerId: '',
	remark: ''
});
const financeRules = reactive({
	typeName: [{ required: true, message: '请选择类型', trigger: 'change' }],
	accountId: [{ required: true, message: '请选择收付款账户', trigger: 'change' }],
	amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
	dateTime: [{ required: true, message: '请选择日期', trigger: 'change' }]
});

const latestFollow = ref(null);
const editingLatest = ref(false);
const latestDraft = ref('');

const composerExpanded = ref(false);
const composerContent = ref('');
const followPanelTitle = computed(() => (selectedFollow.value ? '跟进信息' : '上次跟进信息'));
const followPanelData = computed(() => selectedFollow.value || latestFollow.value || null);

const fieldsNameObj = ref({});
const parseCustomField = () => {
	if (!props.customFields?.length) {
		fieldsNameObj.value = {};
		return;
	}
	const obj = {};
	props.customFields.forEach((item) => {
		if (item.isBase === 2) obj[item.key] = item.name;
	});
	fieldsNameObj.value = obj;
};

watch(() => props.customFields, parseCustomField, { immediate: true, deep: true });

watch(
	() => [props.id, props.visible],
	([id, visible]) => {
		if (!visible || !id) return;
		loadPageData(id);
	},
	{ immediate: true }
);

const prev = () => {
	const index = props.pageIds.indexOf(props.id);
	emit('infoPage', index - 1);
};

const next = () => {
	const index = props.pageIds.indexOf(props.id);
	emit('infoPage', index + 1);
};

const formatTime = (value) => {
	if (!value) return '--';
	if (typeof value === 'string' && value.includes('-')) return value;
	const ts = Number(value);
	if (!ts) return String(value);
	const ms = String(Math.trunc(ts)).length <= 10 ? ts * 1000 : ts;
	const d = new Date(ms);
	if (Number.isNaN(d.getTime())) return String(value);
	const pad = (n) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const plainText = (html = '') => String(html)
	.replace(/<style[\s\S]*?<\/style>/gi, ' ')
	.replace(/<script[\s\S]*?<\/script>/gi, ' ')
	.replace(/<[^>]+>/g, ' ')
	.replace(/&nbsp;/g, ' ')
	.replace(/\s+/g, ' ')
	.trim();

const previewText = (html = '', len = 10) => {
	const text = plainText(html);
	if (!text) return '--';
	return text.length > len ? `${text.slice(0, len)}...` : text;
};

const parseInfoData = (data) => {
	const info = { ...data };
	if (data?.customFields) {
		try {
			const fieldObj = JSON.parse(data.customFields);
			const customFields = Object.keys(fieldObj).map((key) => ({
				label: fieldsNameObj.value[key] || '--',
				value: Array.isArray(fieldObj[key]) ? fieldObj[key].join('，') : fieldObj[key]
			}));
			info.customFields = customFields;
		} catch (e) {
			info.customFields = [];
		}
	}
	if (!info.customFields) info.customFields = [];
	infoData.value = info;
};

const getInfoData = async (id) => {
	const res = await Http.request(ApiClientInfo, { id });
	if (res.data) parseInfoData(res.data);
};

const getReceiptList = async (bizId) => {
	if (!bizId) return;
	const res = await Http.request(ApiReceiptQueryList, {
		page: receiptPager.value.page,
		rows: receiptPager.value.rows,
		counterpartyType: 'client',
		counterpartyId: bizId
	});
	receiptPager.value.total = Number(res.total || 0);
	receiptList.value = (res.list || []).map(item => ({
		...item,
		statusName: Number(item.status) === 1 ? '正常' : '作废'
	}));
};

const getPaymentList = async (bizId) => {
	if (!bizId) return;
	const res = await Http.request(ApiPaymentQueryList, {
		page: paymentPager.value.page,
		rows: paymentPager.value.rows,
		counterpartyType: 'client',
		counterpartyId: bizId
	});
	paymentPager.value.total = Number(res.total || 0);
	paymentList.value = (res.list || []).map(item => ({
		...item,
		statusName: Number(item.status) === 1 ? '正常' : '作废'
	}));
};

const getOperationLogList = async (bizId) => {
	if (!bizId) return;
	logLoading.value = true;
	try {
		const res = await Http.request(ApiOperationLogList, {
			bizType: 'client',
			bizId,
			page: logPager.value.page,
			rows: logPager.value.rows
		});
		logPager.value.total = Number(res.total || 0);
		operationLogList.value = (res.list || []).map((item) => ({
			id: item.id,
			action: item.actionLabel || item.actionType || '--',
			module: item.module || '--',
			operator: item.createByName || item.createBy || '--',
			time: item.createTimeText || formatTime(item.createTime),
			detail: item.detail || '--'
		}));
	} finally {
		logLoading.value = false;
	}
};

const getFollowList = async (bizId) => {
	followLoading.value = true;
	try {
		const res = await Http.request(ApiClientFollowList, {
			bizType: 'client',
			bizId,
			page: followPager.value.page,
			rows: followPager.value.rows
		});
		followList.value = res.list || [];
		followPager.value.total = Number(res.total || 0);
		followPager.value.pageCount = Number(res.pageCount || 0);
		selectedFollow.value = null;
		selectedFollowId.value = '';
	} finally {
		followLoading.value = false;
	}
};

const getLatestFollow = async (bizId) => {
	latestLoading.value = true;
	try {
		const res = await Http.request(ApiClientFollowLatest, {
			bizType: 'client',
			bizId
		});
		latestFollow.value = res.data || null;
	} finally {
		latestLoading.value = false;
	}
};

const loadPageData = async (id) => {
	pageLoading.value = true;
	editingLatest.value = false;
	selectedFollow.value = null;
	selectedFollowId.value = '';
	selectedReceiptId.value = '';
	selectedPaymentId.value = '';
	composerExpanded.value = false;
	composerContent.value = '';
	activeTab.value = 'follow';
	followPager.value.page = 1;
	receiptPager.value.page = 1;
	paymentPager.value.page = 1;
	logPager.value.page = 1;
	try {
		await Promise.all([
			getInfoData(id),
			getFollowList(id),
			getLatestFollow(id),
			getOperationLogList(id),
			getReceiptList(id),
			getPaymentList(id)
		]);
	} finally {
		pageLoading.value = false;
	}
};

const onHeadCommand = (command) => {
	if (command === 'edit') {
		ElMessage.info('请在客户列表中使用“编辑”按钮。');
		return;
	}
	if (command === 'delete') {
		ElMessage.info('删除能力请在客户列表中操作。');
	}
};

const onTabChange = (tab) => {
	activeTab.value = tab;
	composerExpanded.value = false;
	composerContent.value = '';
};

const onCreateReceipt = () => {
	openFinanceDialog('receipt');
};

const onCreatePayment = () => {
	openFinanceDialog('payment');
};

const resetFinanceForm = () => {
	financeForm.typeName = '';
	financeForm.nature = '';
	financeForm.category = '';
	financeForm.accountId = '';
	financeForm.amount = null;
	financeForm.dateTime = '';
	financeForm.handlerId = '';
	financeForm.remark = '';
};

const openFinanceDialog = async (kind) => {
	financeKind.value = kind;
	resetFinanceForm();
	const API = kind === 'receipt' ? ApiReceiptOptions : ApiPaymentOptions;
	const res = await Http.request(API, {});
	financeTypeList.value = res.typeList || [];
	financeNatureList.value = res.natureList || [];
	financeCategoryList.value = res.categoryList || [];
	financeAccountList.value = res.accountList || [];
	financeUserList.value = res.userList || [];
	financeDialogVisible.value = true;
};

const submitFinance = async () => {
	if (!props.id) return;
	if (!financeFormRef.value) return;
	try {
		await financeFormRef.value.validate();
		financeCommitting.value = true;
		const API = financeKind.value === 'receipt' ? ApiReceiptAdd : ApiPaymentAdd;
		await Http.request(API, {
			typeName: financeForm.typeName,
			nature: financeForm.nature || undefined,
			category: financeForm.category || undefined,
			counterpartyType: 'client',
			counterpartyId: props.id,
			counterpartyName: infoData.value?.name || '--',
			accountId: financeForm.accountId,
			amount: Number(financeForm.amount || 0),
			dateTime: Number(financeForm.dateTime),
			handlerId: financeForm.handlerId || undefined,
			remark: financeForm.remark || undefined
		});
		ElMessage.success(financeKind.value === 'receipt' ? '收款记录已创建' : '付款记录已创建');
		financeDialogVisible.value = false;
		receiptPager.value.page = 1;
		paymentPager.value.page = 1;
		await Promise.all([getReceiptList(props.id), getPaymentList(props.id), getOperationLogList(props.id)]);
	} catch (err) {
		// ignore validate reject
	} finally {
		financeCommitting.value = false;
	}
};

const startEditLatest = () => {
	selectedFollow.value = null;
	editingLatest.value = true;
	latestDraft.value = latestFollow.value?.content || '';
};

const cancelEditLatest = () => {
	editingLatest.value = false;
	latestDraft.value = '';
};

const saveLatestFollow = async () => {
	if (!props.id) return;
	if (!plainText(latestDraft.value)) {
		ElMessage.warning('请输入上次跟进信息。');
		return;
	}
	savingLatest.value = true;
	try {
		await Http.request(ApiClientFollowLatestEdit, {
			bizType: 'client',
			bizId: props.id,
			content: latestDraft.value
		});
		ElMessage.success('上次跟进信息已保存');
		editingLatest.value = false;
		latestDraft.value = '';
		selectedFollow.value = null;
		followPager.value.page = 1;
		await Promise.all([getLatestFollow(props.id), getFollowList(props.id), getOperationLogList(props.id)]);
	} finally {
		savingLatest.value = false;
	}
};

const openComposer = () => {
	if (activeTab.value !== 'follow') return;
	composerExpanded.value = true;
};

const cancelComposer = () => {
	composerExpanded.value = false;
	composerContent.value = '';
};

const submitFollow = async () => {
	if (!props.id) return;
	if (!plainText(composerContent.value)) {
		ElMessage.warning('请输入跟进内容。');
		return;
	}
	submittingFollow.value = true;
	try {
		await Http.request(ApiClientFollowAdd, {
			bizType: 'client',
			bizId: props.id,
			content: composerContent.value
		});
		ElMessage.success('跟进记录已创建');
		composerExpanded.value = false;
		composerContent.value = '';
		selectedFollow.value = null;
		followPager.value.page = 1;
		await Promise.all([getFollowList(props.id), getLatestFollow(props.id), getOperationLogList(props.id)]);
	} finally {
		submittingFollow.value = false;
	}
};

const onFollowPageChange = (page) => {
	followPager.value.page = page;
	if (!props.id) return;
	getFollowList(props.id);
};

const onReceiptPageChange = (page) => {
	receiptPager.value.page = page;
	if (!props.id) return;
	getReceiptList(props.id);
};

const onPaymentPageChange = (page) => {
	paymentPager.value.page = page;
	if (!props.id) return;
	getPaymentList(props.id);
};

const onLogPageChange = (page) => {
	logPager.value.page = page;
	if (!props.id) return;
	getOperationLogList(props.id);
};

const showFollowDetail = (row) => {
	selectedFollow.value = row;
	selectedFollowId.value = row?.id || '';
};

const backToLatestFollow = () => {
	selectedFollow.value = null;
	selectedFollowId.value = '';
};

const showFinanceDetail = (kind, row) => {
	selectedFinanceKind.value = kind;
	selectedFinanceRow.value = row;
	financeDetailVisible.value = true;
	if (kind === 'receipt') {
		selectedReceiptId.value = row?.id || '';
		selectedPaymentId.value = '';
		return;
	}
	selectedPaymentId.value = row?.id || '';
	selectedReceiptId.value = '';
};

const followRowClassName = ({ row }) => {
	if (!selectedFollowId.value) return '';
	return row?.id === selectedFollowId.value ? 'is-selected-row' : '';
};

const receiptRowClassName = ({ row }) => {
	if (!selectedReceiptId.value) return '';
	return row?.id === selectedReceiptId.value ? 'is-selected-row' : '';
};

const paymentRowClassName = ({ row }) => {
	if (!selectedPaymentId.value) return '';
	return row?.id === selectedPaymentId.value ? 'is-selected-row' : '';
};
</script>

<template>
	<el-drawer
		v-model="dialogVisible"
		class="_drawer"
		:modal="false"
		size="70%"
		modal-penetrable
		:with-header="false"
	>
		<div class="retract" @click="dialogVisible = false">
			<el-icon><ArrowRightBold /></el-icon>
		</div>
		<div class="__body">
			<div class="header">
				<div class="title">客户详情</div>
				<div class="action">
					<el-button-group>
						<el-button :icon="ArrowUp" :disabled="prevDisabled || pageLoading" @click="prev" />
						<el-button :icon="ArrowDown" :disabled="nextDisabled || pageLoading" @click="next" />
					</el-button-group>
					<el-dropdown trigger="click" placement="bottom-end" @command="onHeadCommand">
						<el-link :icon="MoreFilled" underline="never" />
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="edit">编辑</el-dropdown-item>
								<el-dropdown-item command="delete">删除</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</div>

			<div class="content" v-loading="pageLoading">
				<div class="left">
					<div class="left-scroll">
						<div class="client-overview card">
							<div class="client-name">{{ infoData.name || '--' }}</div>
							<div class="client-meta">
								<span>创建时间：{{ formatTime(infoData.createTime) }}</span>
								<span>更新时间：{{ formatTime(infoData.updateTime) }}</span>
							</div>
						</div>

						<div class="latest-card card">
							<div class="block-head">
								<span>{{ followPanelTitle }}</span>
								<div class="head-actions">
									<el-button v-if="selectedFollow && !editingLatest" link type="primary" @click="backToLatestFollow">返回上次</el-button>
									<el-button v-if="!selectedFollow && !editingLatest" link type="primary" @click="startEditLatest">编辑</el-button>
								</div>
							</div>
							<div v-if="editingLatest" class="latest-editor">
								<Editor v-model="latestDraft" height="180px" />
								<div class="editor-actions">
									<el-button @click="cancelEditLatest">取消</el-button>
									<el-button type="primary" :loading="savingLatest" @click="saveLatestFollow">保存</el-button>
								</div>
							</div>
							<div v-else class="latest-content">
								<div v-if="latestLoading && !selectedFollow" class="empty-line">加载中...</div>
								<template v-else>
									<div v-if="followPanelData?.content" class="html-content" v-html="followPanelData.content"></div>
									<div v-else class="empty-line">暂无跟进信息</div>
									<div v-if="followPanelData" class="latest-meta-line">
										{{ followPanelData.createByName || '--' }} · {{ followPanelData.createTimeText || formatTime(followPanelData.createTime) }}
									</div>
								</template>
							</div>
						</div>

						<div class="tabs-card card">
							<div class="tabs-head">
								<el-tabs v-model="activeTab" @tab-change="onTabChange">
									<el-tab-pane label="跟进记录" name="follow" />
									<el-tab-pane label="收款记录" name="receipt" />
									<el-tab-pane label="付款记录" name="payment" />
									<el-tab-pane label="操作日志" name="log" />
								</el-tabs>
								<div class="tabs-action" v-if="activeTab === 'receipt'">
									<el-button type="primary" plain :icon="Plus" @click="onCreateReceipt">创建</el-button>
								</div>
								<div class="tabs-action" v-if="activeTab === 'payment'">
									<el-button type="primary" plain :icon="Plus" @click="onCreatePayment">创建</el-button>
								</div>
							</div>

							<div class="tabs-content">
								<div v-if="activeTab === 'follow'" class="panel-list">
									<el-table :data="followList" border stripe size="small" :max-height="300" v-loading="followLoading" :row-class-name="followRowClassName">
										<el-table-column type="index" label="#" width="52" align="center" />
										<el-table-column prop="createTimeText" label="跟进时间" min-width="140" />
										<el-table-column prop="createByName" label="跟进人" min-width="100" />
										<el-table-column label="跟进摘要" min-width="220" show-overflow-tooltip>
											<template #default="{ row }">{{ previewText(row.contentText || row.content, 10) }}</template>
										</el-table-column>
										<el-table-column label="操作" width="88" align="center">
											<template #default="{ row }">
												<el-button link type="primary" @click="showFollowDetail(row)">详情</el-button>
											</template>
										</el-table-column>
									</el-table>
									<div class="pager-box">
										<el-pagination
											v-model:current-page="followPager.page"
											:page-size="followPager.rows"
											:total="followPager.total"
											layout="total, prev, pager, next"
											size="small"
											background
											@current-change="onFollowPageChange"
										/>
									</div>
								</div>

								<div v-if="activeTab === 'receipt'" class="panel-list">
									<el-table :data="receiptList" border stripe size="small" :max-height="300" :row-class-name="receiptRowClassName">
										<el-table-column prop="recordNo" label="收款单号" min-width="110" />
										<el-table-column prop="typeName" label="收款类型" min-width="110" />
										<el-table-column prop="amountText" label="金额" min-width="100" />
										<el-table-column prop="statusName" label="状态" min-width="90" />
										<el-table-column prop="dateTimeText" label="时间" min-width="150" />
										<el-table-column prop="remark" label="备注" min-width="130" show-overflow-tooltip />
										<el-table-column label="操作" width="88" align="center">
											<template #default="{ row }">
												<el-button link type="primary" @click="showFinanceDetail('receipt', row)">详情</el-button>
											</template>
										</el-table-column>
									</el-table>
									<div class="pager-box">
										<el-pagination
											v-model:current-page="receiptPager.page"
											:page-size="receiptPager.rows"
											:total="receiptPager.total"
											layout="total, prev, pager, next"
											size="small"
											background
											@current-change="onReceiptPageChange"
										/>
									</div>
								</div>

								<div v-if="activeTab === 'payment'" class="panel-list">
									<el-table :data="paymentList" border stripe size="small" :max-height="300" :row-class-name="paymentRowClassName">
										<el-table-column prop="recordNo" label="付款单号" min-width="110" />
										<el-table-column prop="typeName" label="付款类型" min-width="110" />
										<el-table-column prop="amountText" label="金额" min-width="100" />
										<el-table-column prop="statusName" label="状态" min-width="90" />
										<el-table-column prop="dateTimeText" label="时间" min-width="150" />
										<el-table-column prop="remark" label="备注" min-width="130" show-overflow-tooltip />
										<el-table-column label="操作" width="88" align="center">
											<template #default="{ row }">
												<el-button link type="primary" @click="showFinanceDetail('payment', row)">详情</el-button>
											</template>
										</el-table-column>
									</el-table>
									<div class="pager-box">
										<el-pagination
											v-model:current-page="paymentPager.page"
											:page-size="paymentPager.rows"
											:total="paymentPager.total"
											layout="total, prev, pager, next"
											size="small"
											background
											@current-change="onPaymentPageChange"
										/>
									</div>
								</div>

								<div v-if="activeTab === 'log'" class="panel-list">
									<el-table :data="operationLogList" border stripe size="small" :max-height="300" v-loading="logLoading">
										<el-table-column prop="action" label="操作类型" min-width="130" />
										<el-table-column prop="module" label="模块" min-width="90" />
										<el-table-column prop="operator" label="操作人" min-width="100" />
										<el-table-column prop="time" label="操作时间" min-width="150" />
										<el-table-column prop="detail" label="说明" min-width="180" show-overflow-tooltip />
									</el-table>
									<div class="pager-box">
										<el-pagination
											v-model:current-page="logPager.page"
											:page-size="logPager.rows"
											:total="logPager.total"
											layout="total, prev, pager, next"
											size="small"
											background
											@current-change="onLogPageChange"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="follow-composer" v-if="activeTab === 'follow'">
						<div v-if="!composerExpanded" class="composer-placeholder" @click="openComposer">
							点击输入跟进记录...
						</div>
						<div v-else class="composer-expand">
							<Editor v-model="composerContent" height="220px" />
							<div class="editor-actions">
								<el-button @click="cancelComposer">取消</el-button>
								<el-button type="primary" :loading="submittingFollow" @click="submitFollow">提交</el-button>
							</div>
						</div>
					</div>
				</div>

				<div class="right">
					<div class="info-title">基础信息</div>
					<el-form label-position="right" label-width="auto">
						<el-form-item label="客户编号"><span>{{ infoData.code || '--' }}</span></el-form-item>
						<el-form-item label="客户类型"><span>{{ infoData.type || '--' }}</span></el-form-item>
						<el-form-item label="客户来源"><span>{{ infoData.source || '--' }}</span></el-form-item>
						<el-form-item label="客户行业"><span>{{ infoData.industry || '--' }}</span></el-form-item>
						<el-form-item label="客户负责人"><span>{{ infoData.principalName || '--' }}</span></el-form-item>
						<el-form-item label="客服专员"><span>{{ infoData.serviceUserNames || '--' }}</span></el-form-item>
						<el-form-item label="所在地区"><span>{{ infoData.areaText || '--' }}</span></el-form-item>
						<el-form-item label="详细地址"><span>{{ infoData.address || '--' }}</span></el-form-item>
						<el-form-item label="其他备注"><span>{{ infoData.remark || '--' }}</span></el-form-item>
					</el-form>

					<div class="cut-line" />
					<div class="info-title">其他信息</div>
					<el-form label-position="right" label-width="auto">
						<el-form-item v-for="item in infoData.customFields" :key="item.label" :label="item.label">
							<span>{{ item.value || '--' }}</span>
						</el-form-item>
					</el-form>

					<div class="cut-line" />
					<div class="info-title">联系人信息</div>
					<el-form label-position="right" label-width="auto">
						<el-form-item label="联系人姓名"><span>{{ infoData.contactName || '--' }}</span></el-form-item>
						<el-form-item label="联系人手机号"><span>{{ infoData.contactPhone || '--' }}</span></el-form-item>
						<el-form-item label="备用联系方式"><span>{{ infoData.contactExtend || '--' }}</span></el-form-item>
						<el-form-item label="联系邮箱"><span>{{ infoData.contactEmail || '--' }}</span></el-form-item>
						<el-form-item label="备注"><span>{{ infoData.contactRemark || '--' }}</span></el-form-item>
					</el-form>

					<div class="cut-line" />
					<div class="info-title">开票信息</div>
					<el-form label-position="right" label-width="auto">
						<el-form-item label="发票抬头"><span>{{ infoData.invoiceTitle || '--' }}</span></el-form-item>
						<el-form-item label="单位电话"><span>{{ infoData.invoiceTelephone || '--' }}</span></el-form-item>
						<el-form-item label="地址"><span>{{ infoData.invoiceAddress || '--' }}</span></el-form-item>
						<el-form-item label="纳税人识别号"><span>{{ infoData.invoiceITIN || '--' }}</span></el-form-item>
					</el-form>
				</div>
			</div>
		</div>
	</el-drawer>
	<el-dialog
		v-model="financeDialogVisible"
		width="560"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		:title="financeKind === 'receipt' ? '新增收款' : '新增付款'"
	>
		<el-form ref="financeFormRef" :model="financeForm" :rules="financeRules" label-width="auto">
			<el-form-item :label="financeKind === 'receipt' ? '收款日期' : '付款日期'" prop="dateTime">
				<el-date-picker v-model="financeForm.dateTime" type="date" value-format="X" placeholder="请选择日期" style="width: 100%" />
			</el-form-item>
			<el-form-item :label="financeKind === 'receipt' ? '收款类型' : '付款类型'" prop="typeName">
				<el-select v-model="financeForm.typeName" placeholder="请选择" clearable filterable>
					<el-option v-for="item in financeTypeList" :key="item.id" :label="item.name" :value="item.name" />
				</el-select>
			</el-form-item>
			<el-form-item :label="financeKind === 'receipt' ? '收款性质' : '付款性质'">
				<el-select v-model="financeForm.nature" placeholder="请选择" clearable filterable>
					<el-option v-for="item in financeNatureList" :key="item.id" :label="item.name" :value="item.name" />
				</el-select>
			</el-form-item>
			<el-form-item label="收支类别">
				<el-select v-model="financeForm.category" placeholder="请选择" clearable filterable>
					<el-option v-for="item in financeCategoryList" :key="item.id" :label="item.name" :value="item.name" />
				</el-select>
			</el-form-item>
			<el-form-item label="往来单位">
				<el-input :model-value="infoData.name || '--'" disabled />
			</el-form-item>
			<el-form-item label="收付款账户" prop="accountId">
				<el-select v-model="financeForm.accountId" placeholder="请选择账户" clearable filterable>
					<el-option v-for="item in financeAccountList" :key="item.id" :label="item.label" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item :label="financeKind === 'receipt' ? '收款金额' : '付款金额'" prop="amount">
				<el-input-number
					v-model="financeForm.amount"
					style="width: 100%"
					:max="9999999999"
					:min="0"
					:value-on-clear="null"
					:controls="false"
					:precision="2"
					disabled-scientific
					placeholder="请输入金额"
				>
					<template #suffix>￥</template>
				</el-input-number>
			</el-form-item>
			<el-form-item :label="financeKind === 'receipt' ? '收款人' : '付款人'">
				<el-select v-model="financeForm.handlerId" placeholder="请选择" clearable filterable>
					<el-option v-for="item in financeUserList" :key="item.id" :label="item.name" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item label="备注">
				<el-input v-model="financeForm.remark" type="textarea" maxlength="120" :rows="3" placeholder="可填写摘要、说明等" />
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="financeDialogVisible = false">取消</el-button>
			<el-button type="primary" :loading="financeCommitting" @click="submitFinance">保存</el-button>
		</template>
	</el-dialog>
	<finance-detail-dialog
		v-model="financeDetailVisible"
		:kind="selectedFinanceKind"
		:row="selectedFinanceRow"
	/>
</template>

<style scoped lang="scss">
.left {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-width: 0;
	position: relative;
}

.left-scroll {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	padding-bottom: 124px;
}

.card {
	background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
	border: 1px solid #e7eaf2;
	border-radius: 10px;
	box-shadow: 0 3px 10px rgba(17, 24, 39, 0.04);
}

.client-overview {
	padding: 14px 16px;
	margin-bottom: 12px;
	.client-name {
		font-size: 22px;
		font-weight: 600;
		color: var(--text-color);
		line-height: 1.3;
	}
	.client-meta {
		margin-top: 8px;
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		color: var(--secondary);
		font-size: 13px;
	}
}

.latest-card,
.tabs-card {
	padding: 12px 14px;
	margin-bottom: 12px;
}

.block-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 10px;
}

.head-actions {
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

//.latest-content {
//	min-height: 120px;
//}

.html-content {
	font-size: 14px;
	line-height: 1.7;
	color: var(--text-color2);
}

:deep(.html-content p) {
	margin: 5px 0;
}

:deep(.html-content ul),
:deep(.html-content ol) {
	margin: 5px 0;
	padding-left: 22px;
}

:deep(.html-content li) {
	margin: 5px 0;
	list-style-position: outside;
}

:deep(.html-content table) {
	width: 100%;
	border-collapse: collapse;
	border: 1px solid #d9dee8;
	margin: 5px 0;
}

:deep(.html-content th),
:deep(.html-content td) {
	border: 1px solid #d9dee8;
	padding: 6px 8px;
	vertical-align: top;
}

.latest-meta-line {
	margin-top: 10px;
	font-size: 12px;
	color: var(--secondary);
}

.tabs-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 10px;
	:deep(.el-tabs) {
		width: 100%;
	}
	:deep(.el-tabs__header) {
		margin-bottom: 2px;
	}
}

.tabs-action {
	padding-bottom: 8px;
	flex-shrink: 0;
}

.tabs-content {
	margin-top: 10px;
}

.follow-detail-box {
	padding: 10px 12px;
	margin-bottom: 10px;
	border: 1px solid #e8edf7;
	border-radius: 8px;
	background: #f9fbff;
}

.follow-detail-head {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: var(--secondary);
	margin-bottom: 8px;
}

.follow-detail-content {
	font-size: 13px;
	line-height: 1.7;
	color: var(--text-color2);
}

.pager-box {
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
}

:deep(.el-table .is-selected-row > td.el-table__cell) {
	background-color: #eaf2ff !important;
}

.empty-line {
	font-size: 13px;
	color: var(--secondary);
	line-height: 30px;
	text-align: center;
	padding: 20px 0;
}

.follow-composer {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 50;
	width: 100%;
	box-sizing: border-box;
	padding: 10px 16px;
	border-top: 1px solid var(--border);
	background: var(--bg-color-main);
	box-shadow: 0 -4px 10px var(--border-shadow-little);
}

.composer-placeholder {
	height: 40px;
	width: 100%;
	box-sizing: border-box;
	border: 1px solid #d9e1ef;
	border-radius: 8px;
	padding: 0 12px;
	display: flex;
	align-items: center;
	color: var(--secondary);
	cursor: text;
	background: #fff;
}

.composer-expand {
	position: relative;
	z-index: 60;
	border: 1px solid #d9e1ef;
	border-radius: 8px;
	background: #fff;
	padding: 10px;
	box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
}

.editor-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
}

@media (max-width: 1200px) {
	.follow-composer {
		position: static;
		margin-top: 10px;
		padding: 0;
		border-top: 0;
		box-shadow: none;
	}
	.left-scroll {
		padding-bottom: 16px;
	}
}
</style>
