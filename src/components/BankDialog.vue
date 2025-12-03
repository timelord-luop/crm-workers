<script setup>
import {computed, nextTick, reactive, ref} from "vue";
import CommonUtil from "@/assets/js/commonUtil.js";

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

const dialogData = ref({});
const onOpen = () => {
	nextTick(() => {
		dialogData.value = CommonUtil.deepClone(props.bankData);
		formRef.value?.resetFields()
	})
}

const rules = reactive({
	account: [{required: true, message: '请输入银行账号', trigger: 'change'}],
	userName: [{required: true, message: '请输入户名', trigger: 'change'}],
	bankName: [{required: true, message: '请选择银行', trigger: 'change'}]
})
const bankList = ref([
	"中国银行",
	"中国工商银行",
	"中国农业银行",
	"中国建设银行",
	"招商银行",
	"交通银行",
	"平安银行",
	"中信银行",
	"兴业银行",
	"光大银行",
	"民生银行",
	"中国邮政储蓄银行",
	"上海浦东发展银行",
	"广发银行",
	"华夏银行",
	"北京银行",
	"上海银行",
	"浙江农商银行",
	"宁波银行",
	"江苏银行",
	"南京银行",
	"广州银行",
	"成都银行",
	"渤海银行",
	"重庆银行"
])
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
			el-form-item(label="银行名称" prop="bankName")
				el-select(v-model="dialogData.bankName" filterable placeholder="请选择")
					el-option(v-for="item in bankList" :label="item" :value="item")
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
