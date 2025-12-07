<script setup>
import {computed, nextTick, reactive, ref} from "vue";
import { QuestionFilled } from '@element-plus/icons-vue'
import CommonUtil from "@/assets/js/commonUtil.js";
import Http from "@/plugins/http.js";
import {ApiSysDictionaryRows} from "@/configuration/api/common.js";

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	bankData: {
		type: Object,
		default: () => {
			return {}
		}
	}
})

const dialogVisible = computed({
	get: () => props.visible,
	set: (val) => emit('update:visible', val)
})

const emit = defineEmits(['update:visible', 'confirm'])

const formRef = ref();

const bankList = ref([]);

const dialogData = ref({});
const onOpen = () => {
	nextTick(() => {
		dialogData.value = CommonUtil.deepClone(props.bankData);
		formRef.value?.resetFields()
	})
	if (!bankList.value.length) getDictList();
}

const rules = reactive({
	account: [{required: true, message: '请输入银行账号', trigger: 'change'}],
	userName: [{required: true, message: '请输入户名', trigger: 'change'}],
	bankName: [{required: true, message: '请选择银行', trigger: 'change'}]
})

const getDictList = () => {
	const params = {
		dictKey: ['BANK']
	};
	Http.request(ApiSysDictionaryRows, params).then(res => {
		bankList.value = res.list;
	})
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return;
		emit('confirm', dialogData.value);
		dialogVisible.value = false;
	})
}
</script>

<template lang="pug">
	el-dialog(v-model="dialogVisible"
		width="520"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		@open="onOpen"
		:title="dialogData.act === 'edit' ? '编辑银行卡' : '添加银行卡'")
		el-form(
			ref="formRef"
			:model="dialogData"
			:rules="rules"
			@submit.prevent
			label-width="auto"
		)
			el-form-item(label="银行账号" prop="account")
				el-input(v-model="dialogData.account" maxlength="22" placeholder="请输入" )
			el-form-item(label="户名" prop="userName")
				el-input(v-model="dialogData.userName" maxlength="22" placeholder="请输入" )
			el-form-item(prop="bankName")
				template(#label)
					span
						span 银行名称
						el-popover( placement="top-start" content="“系统设置-数据字典” 维护" :show-after="300" width="200")
							template(#reference)
								el-icon._label-icon
									QuestionFilled
				el-select(v-model="dialogData.bankName" filterable placeholder="请选择")
					el-option(v-for="item in bankList" :key="item.id" :label="item.name" :value="item.name")
			el-form-item(label="开户行")
				el-input(v-model="dialogData.openingBank" maxlength="64" placeholder="请输入" )
			el-form-item(label="行号")
				el-input(v-model="dialogData.bankCode" maxlength="64" placeholder="请输入" )
			el-form-item(label="备注")
				el-input(v-model="dialogData.remark" type="textarea" maxlength="255" :rows="3" placeholder="请输入" )
		template(#footer)
			el-button(@click="dialogVisible = false") 取消
			el-button(type="primary" @click="toCommit(formRef)") 保存
</template>

<style scoped lang="scss">

</style>
