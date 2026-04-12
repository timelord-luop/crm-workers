<script setup>
import {ArrowRightBold, ArrowUp, ArrowDown, MoreFilled, Plus} from '@element-plus/icons-vue'
import {computed, ref, watch, onMounted} from "vue";
import Http from "@/plugins/http.js";
import {ApiClientInfo} from "@/configuration/api/client.js";
import Editor from "@/components/Editor.vue";

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
})
const dialogVisible = computed({
	get: () => props.visible,
	set: (val) => emit('update:visible', val)
})
const emit = defineEmits(['update:visible', 'infoPage'])

const prevDisabled = computed(() => {
	return props.pageIds.indexOf(props.id) === 0
})
const nextDisabled = computed(() => {
	return props.pageIds.indexOf(props.id) === props.pageIds.length - 1
})
const prev = () => {
	const index = props.pageIds.indexOf(props.id);
	emit('infoPage', index - 1);
}
const next = () => {
	const index = props.pageIds.indexOf(props.id);
	emit('infoPage', index + 1);
}

const infoData = ref({});
const activeTab = ref('follow');
const showEditor = ref(false);
const editorContent = ref('');
const followList = ref([]);
const paymentList = ref([]);
const receiptList = ref([]);

watch(() => props.id, (val) => {
	parseCustomField();
	getInfoData(val);
	if (val) {
		getFollowList(val);
		getPaymentList(val);
		getReceiptList(val);
	}
})

const fieldsNameObj = ref({});
const parseCustomField = () => {
	if (props.customFields?.length) {
		let obj = {};
		props.customFields.forEach(item => {
			if (item.isBase === 2) {
				obj[item.key] = item.name
			}
		})
		fieldsNameObj.value = obj;
	}
}

const pageLoading = ref(false);
const getInfoData = (id) => {
	pageLoading.value = true;
	Http.request(ApiClientInfo, {id: id}).then(res => {
		pageLoading.value = false;
		if (res.data) {
			parseInfoData(res.data)
		}
	}).catch(err => {
		console.log(err);
		pageLoading.value = false;
	})
}
const parseInfoData = (data) => {
	const info = {
		...data,
	};
	if (data.customFields) {
		const fieldObj = JSON.parse(data.customFields);
		let customFields = [];
		for (const key of Object.keys(fieldObj)) {
			customFields.push({
				label: fieldsNameObj.value[key] || '--',
				value: Array.isArray(fieldObj[key]) ? fieldObj[key].join() : fieldObj[key]
			})
		}
		info.customFields = customFields;
	}
	infoData.value = info;
}

// 获取跟进记录
const getFollowList = (clientId) => {
	// 模拟数据
	followList.value = [
		{
			id: 1,
			content: '跟进客户需求',
			createTime: '2026-04-10 15:14:06',
			createUser: '王良财'
		},
		{
			id: 2,
			content: '确认合作细节',
			createTime: '2026-04-09 10:30:00',
			createUser: '王良财'
		}
	];
};

// 获取付款列表
const getPaymentList = (clientId) => {
	// 模拟数据
	paymentList.value = [
		{
			id: 1,
			amount: '10000.00',
			paymentTime: '2026-04-10 15:14:06',
			remark: '合同首款'
		},
		{
			id: 2,
			amount: '20000.00',
			paymentTime: '2026-04-09 10:30:00',
			remark: '合同尾款'
		}
	];
};

// 获取收款列表
const getReceiptList = (clientId) => {
	// 模拟数据
	receiptList.value = [
		{
			id: 1,
			amount: '5000.00',
			receiptTime: '2026-04-10 15:14:06',
			remark: '服务费用'
		},
		{
			id: 2,
			amount: '8000.00',
			receiptTime: '2026-04-09 10:30:00',
			remark: '产品费用'
		}
	];
};

// 打开富文本编辑器
const openEditor = () => {
	showEditor.value = true;
	// 延迟初始化编辑器，确保DOM已经渲染
	setTimeout(() => {
		initEditor();
	}, 100);
};

// 关闭富文本编辑器
const closeEditor = () => {
	showEditor.value = false;
	editorContent.value = '';
};

// 提交跟进信息
const submitFollow = () => {
	// 这里可以添加提交逻辑
	console.log('提交跟进信息:', editorContent.value);
	closeEditor();
	// 重新获取跟进记录
	getFollowList(props.id);
};

// 初始化wangeditor
const initEditor = () => {
	if (window.WangEditor) {
		const editor = window.WangEditor.createEditor({
			selector: '#editor-container',
			html: editorContent.value
		});
		
		editor.on('change', () => {
			editorContent.value = editor.getHtml();
		});
	}
};

// 切换tab
const switchTab = (tab) => {
	activeTab.value = tab;
	showEditor.value = false;
};

// 新建按钮点击事件
const handleCreate = () => {
	if (activeTab.value === 'follow') {
		openEditor();
	}
};
</script>

<template lang="pug">
	el-drawer._drawer(v-model="dialogVisible" :modal="false" size="70%" modal-penetrable :with-header="false")
		.retract(@click="dialogVisible = false")
			el-icon
				ArrowRightBold
		.__body
			.header
				.title 客户详情
				.action
					el-button-group
						el-button(:icon="ArrowUp" :disabled="prevDisabled || pageLoading" @click="prev")
						el-button(:icon="ArrowDown" :disabled="nextDisabled || pageLoading" @click="next")
					el-dropdown(trigger="click" placement="bottom-end")
						el-link(:icon="MoreFilled" underline="never")
						template(#dropdown)
							el-dropdown-menu
								el-dropdown-item(command="edit") 编辑
								el-dropdown-item(command="delete") 删除
			.content(v-loading="pageLoading")
				.left
					.main
						editor
					.footer

				.right
					.info-title 基础信息
					el-form(label-position="right" label-width="auto")
						el-form-item(label="客户编号")
							span {{infoData.code}}
						el-form-item(label="客户类型" class="is-required")
							span {{infoData.type}}
						el-form-item(label="客户来源" class="is-required")
							span {{infoData.source}}
						el-form-item(label="客户行业")
							span {{infoData.industry}}
						el-form-item(label="客户负责人" class="is-required")
							span {{infoData.principalName}}
						el-form-item(label="客服专员")
							span {{infoData.serviceUserNames}}
						el-form-item(label="所在地区")
							span {{infoData.areaText}}
						el-form-item(label="详细地址")
							span {{infoData.address}}
						el-form-item(label="其他备注")
							span {{infoData.remark}}
					.cut-line
					.info-title 其他信息
					el-form(label-position="right" label-width="auto")
						el-form-item(v-for="item in infoData.customFields" :label="item.label")
							span {{item.value}}
					.cut-line
					.info-title 联系人信息
					el-form(label-position="right" label-width="auto")
						el-form-item(label="联系人姓名")
							span {{infoData.contactName}}
						el-form-item(label="联系人手机号")
							span {{infoData.contactPhone}}
						el-form-item(label="备用联系方式")
							span {{infoData.contactExtend}}
						el-form-item(label="联系邮箱")
							span {{infoData.contactEmail}}
						el-form-item(label="备注")
							span {{infoData.contactRemark}}
					.cut-line
					.info-title 财务信息

					.cut-line
					.info-title 开票信息
					el-form(label-position="right" label-width="auto")
						el-form-item(label="发票抬头")
							span {{infoData.invoiceTitle}}
						el-form-item(label="单位电话")
							span {{infoData.invoiceTelephone}}
						el-form-item(label="地址")
							span {{infoData.invoiceAddress}}
						el-form-item(label="纳税人识别号")
							span {{infoData.invoiceITIN}}
</template>

<style scoped lang="scss">

</style>
