<script setup>
import { computed, ref, watch } from 'vue';
import { ArrowRightBold, ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Http from '@/plugins/http.js';
import Editor from '@/components/Editor.vue';
import { ApiLeadsInfo, ApiLeadsFollowAdd, ApiLeadsFollowLatest, ApiLeadsFollowLatestEdit, ApiLeadsFollowList } from '@/configuration/api/leads.js';
import { ApiOpportunityInfo, ApiOpportunityFollowAdd, ApiOpportunityFollowLatest, ApiOpportunityFollowLatestEdit, ApiOpportunityFollowList } from '@/configuration/api/opportunity.js';
import { ApiOperationLogList } from '@/configuration/api/client.js';

const props = defineProps({
	visible: Boolean,
	id: String,
	pageIds: { type: Array, default: () => [] },
	bizType: { type: String, default: 'leads' }
});
const emit = defineEmits(['update:visible', 'infoPage']);
const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) });
const prevDisabled = computed(() => props.pageIds.indexOf(props.id) === 0);
const nextDisabled = computed(() => props.pageIds.indexOf(props.id) === props.pageIds.length - 1);
const infoData = ref({});
const followList = ref([]);
const selectedFollow = ref(null);
const selectedFollowId = ref('');
const followPager = ref({ page: 1, rows: 10, total: 0 });
const operationLogList = ref([]);
const logPager = ref({ page: 1, rows: 10, total: 0 });
const latestFollow = ref(null);
const latestDraft = ref('');
const editingLatest = ref(false);
const composerExpanded = ref(false);
const composerContent = ref('');
const pageLoading = ref(false);
const followLoading = ref(false);
const logLoading = ref(false);
const committing = ref(false);
const savingLatest = ref(false);
const activeTab = ref('follow');
const isLeads = computed(() => props.bizType === 'leads');
const titleText = computed(() => (isLeads.value ? '线索详情' : '商机详情'));
const infoApi = computed(() => (isLeads.value ? ApiLeadsInfo : ApiOpportunityInfo));
const followApis = computed(() => ({
	list: isLeads.value ? ApiLeadsFollowList : ApiOpportunityFollowList,
	add: isLeads.value ? ApiLeadsFollowAdd : ApiOpportunityFollowAdd,
	latest: isLeads.value ? ApiLeadsFollowLatest : ApiOpportunityFollowLatest,
	latestEdit: isLeads.value ? ApiLeadsFollowLatestEdit : ApiOpportunityFollowLatestEdit
}));

const formatTime = (value) => {
	if (!value) return '--';
	const ts = Number(value);
	const ms = String(Math.trunc(ts)).length <= 10 ? ts * 1000 : ts;
	const d = new Date(ms);
	const pad = (n) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const plainText = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const previewText = (html = '', len = 10) => {
	const text = plainText(html);
	return !text ? '--' : text.length > len ? `${text.slice(0, len)}...` : text;
};
const followPanelTitle = computed(() => (selectedFollow.value ? '跟进信息' : '上次跟进信息'));
const followPanelData = computed(() => selectedFollow.value || latestFollow.value || null);

watch(() => [props.id, props.visible], async ([id, visible]) => {
	if (!id || !visible) return;
	pageLoading.value = true;
	activeTab.value = 'follow';
	selectedFollow.value = null;
	selectedFollowId.value = '';
	composerExpanded.value = false;
	composerContent.value = '';
	try {
		await Promise.all([loadInfo(id), loadFollow(id), loadLatest(id), loadLog(id)]);
	} finally {
		pageLoading.value = false;
	}
}, { immediate: true });

const prev = () => emit('infoPage', props.pageIds.indexOf(props.id) - 1);
const next = () => emit('infoPage', props.pageIds.indexOf(props.id) + 1);
const loadInfo = async (id) => {
	const res = await Http.request(infoApi.value, { id });
	infoData.value = res.data || {};
};
const loadFollow = async (id) => {
	followLoading.value = true;
	try {
		const res = await Http.request(followApis.value.list, { bizType: props.bizType, bizId: id, page: followPager.value.page, rows: followPager.value.rows });
		followList.value = res.list || [];
		followPager.value.total = Number(res.total || 0);
	} finally {
		followLoading.value = false;
	}
};
const loadLatest = async (id) => {
	const res = await Http.request(followApis.value.latest, { bizType: props.bizType, bizId: id });
	latestFollow.value = res.data || null;
};
const loadLog = async (id) => {
	logLoading.value = true;
	try {
		const res = await Http.request(ApiOperationLogList, { bizType: props.bizType, bizId: id, page: logPager.value.page, rows: logPager.value.rows });
		logPager.value.total = Number(res.total || 0);
		operationLogList.value = (res.list || []).map(item => ({
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
const startEditLatest = () => { selectedFollow.value = null; editingLatest.value = true; latestDraft.value = latestFollow.value?.content || ''; };
const cancelEditLatest = () => { editingLatest.value = false; latestDraft.value = ''; };
const saveLatestFollow = async () => {
	if (!props.id) return;
	if (!plainText(latestDraft.value)) return ElMessage.warning('请输入上次跟进信息');
	savingLatest.value = true;
	try {
		await Http.request(followApis.value.latestEdit, { bizType: props.bizType, bizId: props.id, content: latestDraft.value });
		editingLatest.value = false;
		await Promise.all([loadLatest(props.id), loadFollow(props.id), loadLog(props.id), loadInfo(props.id)]);
	} finally { savingLatest.value = false; }
};
const submitFollow = async () => {
	if (!props.id) return;
	if (!plainText(composerContent.value)) return ElMessage.warning('请输入跟进内容');
	committing.value = true;
	try {
		await Http.request(followApis.value.add, { bizType: props.bizType, bizId: props.id, content: composerContent.value });
		composerExpanded.value = false;
		composerContent.value = '';
		selectedFollow.value = null;
		selectedFollowId.value = '';
		followPager.value.page = 1;
		await Promise.all([loadLatest(props.id), loadFollow(props.id), loadLog(props.id), loadInfo(props.id)]);
	} finally { committing.value = false; }
};
const showFollowDetail = (row) => { selectedFollow.value = row; selectedFollowId.value = row?.id || ''; };
const backToLatestFollow = () => { selectedFollow.value = null; selectedFollowId.value = ''; };
const followRowClassName = ({ row }) => row?.id === selectedFollowId.value ? 'is-selected-row' : '';
</script>

<template>
	<el-drawer v-model="dialogVisible" class="_drawer" :modal="false" size="70%" modal-penetrable :with-header="false">
		<div class="retract" @click="dialogVisible = false"><el-icon><ArrowRightBold /></el-icon></div>
		<div class="__body" v-loading="pageLoading">
			<div class="header">
				<div class="title">{{ titleText }}</div>
				<div class="action">
					<el-button-group>
						<el-button :icon="ArrowUp" :disabled="prevDisabled || pageLoading" @click="prev" />
						<el-button :icon="ArrowDown" :disabled="nextDisabled || pageLoading" @click="next" />
					</el-button-group>
				</div>
			</div>
			<div class="content">
				<div class="left">
					<div class="left-scroll">
						<div class="client-overview card">
							<div class="client-name">{{ infoData.name || '--' }}</div>
							<div class="client-meta"><span>创建时间：{{ formatTime(infoData.createTime) }}</span><span>更新时间：{{ formatTime(infoData.updateTime) }}</span></div>
						</div>
						<div class="latest-card card">
							<div class="block-head">
								<span>{{ followPanelTitle }}</span>
								<div class="head-actions">
									<el-button v-if="selectedFollow && !editingLatest" link type="primary" @click="backToLatestFollow">返回上次</el-button>
									<el-button v-if="!selectedFollow && !editingLatest" link type="primary" @click="startEditLatest">编辑</el-button>
								</div>
							</div>
							<div v-if="editingLatest"><Editor v-model="latestDraft" height="180px" /><div class="editor-actions"><el-button @click="cancelEditLatest">取消</el-button><el-button type="primary" :loading="savingLatest" @click="saveLatestFollow">保存</el-button></div></div>
							<div v-else class="latest-content">
								<div v-if="followPanelData?.content" class="html-content" v-html="followPanelData.content"></div>
								<div v-else class="empty-line">暂无跟进信息</div>
							</div>
						</div>
						<div class="tabs-card card">
							<el-tabs v-model="activeTab"><el-tab-pane label="跟进记录" name="follow" /><el-tab-pane label="操作日志" name="log" /></el-tabs>
							<div v-if="activeTab==='follow'">
								<el-table :data="followList" border stripe size="small" :max-height="300" v-loading="followLoading" :row-class-name="followRowClassName">
									<el-table-column type="index" label="#" width="52" align="center" />
									<el-table-column prop="createTimeText" label="跟进时间" min-width="140" />
									<el-table-column prop="createByName" label="跟进人" min-width="100" />
									<el-table-column label="跟进摘要" min-width="220" show-overflow-tooltip><template #default="{ row }">{{ previewText(row.contentText || row.content, 10) }}</template></el-table-column>
									<el-table-column label="操作" width="88" align="center"><template #default="{ row }"><el-button link type="primary" @click="showFollowDetail(row)">详情</el-button></template></el-table-column>
								</el-table>
								<div class="pager-box"><el-pagination v-model:current-page="followPager.page" :page-size="followPager.rows" :total="followPager.total" layout="total, prev, pager, next" size="small" background @current-change="(p)=>{followPager.page=p;loadFollow(props.id)}" /></div>
							</div>
							<div v-if="activeTab==='log'">
								<el-table :data="operationLogList" border stripe size="small" :max-height="300" v-loading="logLoading">
									<el-table-column prop="action" label="操作类型" min-width="130" />
									<el-table-column prop="module" label="模块" min-width="90" />
									<el-table-column prop="operator" label="操作人" min-width="100" />
									<el-table-column prop="time" label="操作时间" min-width="150" />
									<el-table-column prop="detail" label="说明" min-width="180" show-overflow-tooltip />
								</el-table>
								<div class="pager-box"><el-pagination v-model:current-page="logPager.page" :page-size="logPager.rows" :total="logPager.total" layout="total, prev, pager, next" size="small" background @current-change="(p)=>{logPager.page=p;loadLog(props.id)}" /></div>
							</div>
						</div>
					</div>
					<div class="follow-composer" v-if="activeTab==='follow'">
						<div v-if="!composerExpanded" class="composer-placeholder" @click="composerExpanded=true">点击输入跟进记录...</div>
						<div v-else class="composer-expand"><Editor v-model="composerContent" height="220px" /><div class="editor-actions"><el-button @click="composerExpanded=false;composerContent=''">取消</el-button><el-button type="primary" :loading="committing" @click="submitFollow">提交</el-button></div></div>
					</div>
				</div>
				<div class="right">
					<div class="info-title">基础信息</div>
					<el-form label-width="auto">
						<el-form-item :label="isLeads ? '客户/公司' : '客户名称'"><span>{{ infoData.clientName || '--' }}</span></el-form-item>
						<el-form-item label="联系人"><span>{{ infoData.contactName || '--' }}</span></el-form-item>
						<el-form-item label="联系电话"><span>{{ infoData.contactPhone || '--' }}</span></el-form-item>
						<el-form-item label="来源"><span>{{ infoData.source || '--' }}</span></el-form-item>
						<el-form-item label="产品意向"><span>{{ infoData.productIntent || '--' }}</span></el-form-item>
						<el-form-item :label="isLeads ? '状态' : '阶段'"><span>{{ infoData.statusName || infoData.stageName || infoData.status || infoData.stage || '--' }}</span></el-form-item>
						<el-form-item label="负责人"><span>{{ infoData.ownerName || '--' }}</span></el-form-item>
						<el-form-item label="下次联系"><span>{{ formatTime(infoData.nextContactTime) }}</span></el-form-item>
						<el-form-item label="备注"><span>{{ infoData.remark || '--' }}</span></el-form-item>
					</el-form>
				</div>
			</div>
		</div>
	</el-drawer>
</template>

<style scoped lang="scss">
.left { display: flex; flex-direction: column; height: 100%; min-width: 0; position: relative; }
.left-scroll { flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 124px; }
.card { background: #fff; border: 1px solid #e7eaf2; border-radius: 10px; box-shadow: 0 3px 10px rgba(17,24,39,.04); padding: 12px 14px; margin-bottom: 12px; }
.client-overview .client-name { font-size: 22px; font-weight: 600; }
.client-overview .client-meta { margin-top: 8px; display: flex; gap: 12px; color: var(--secondary); font-size: 13px; }
.block-head { display:flex; justify-content:space-between; align-items:center; font-weight:600; margin-bottom:10px; }
.html-content { font-size: 14px; line-height: 1.7; }
:deep(.html-content p){ margin:5px 0; }
:deep(.html-content ul), :deep(.html-content ol){ margin:5px 0; padding-left:22px; }
:deep(.html-content table){ width:100%; border-collapse:collapse; border:1px solid #d9dee8; margin:5px 0; }
:deep(.html-content th), :deep(.html-content td){ border:1px solid #d9dee8; padding:6px 8px; }
.pager-box { display:flex; justify-content:flex-end; margin-top:10px; }
.follow-composer { position:absolute; left:0; right:0; bottom:0; z-index:50; width:100%; padding:10px 16px; border-top:1px solid var(--border); background:var(--bg-color-main); }
.composer-placeholder { height:40px; border:1px solid #d9e1ef; border-radius:8px; padding:0 12px; display:flex; align-items:center; color:var(--secondary); background:#fff; cursor:text; }
.composer-expand { z-index:60; border:1px solid #d9e1ef; border-radius:8px; background:#fff; padding:10px; box-shadow:0 8px 24px rgba(15,23,42,.14); position:relative; }
.editor-actions { display:flex; justify-content:flex-end; margin-top:10px; }
:deep(.el-table .is-selected-row > td.el-table__cell) { background-color: #eaf2ff !important; }
</style>
