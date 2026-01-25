<script setup>
import {ArrowRightBold, ArrowUp, ArrowDown, MoreFilled} from '@element-plus/icons-vue'
import {computed, ref, watch} from "vue";
import Http from "@/plugins/http.js";
import {ApiClientInfo} from "@/configuration/api/client.js";

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

watch(() => props.id, (val) => {
	parseCustomField();
	getInfoData(val);
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
</script>

<template lang="pug">
	el-drawer._drawer(v-model="dialogVisible" :modal="false" size="64%" modal-penetrable :with-header="false")
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
