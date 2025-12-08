<script setup>
import BankDialog from "@/components/BankDialog.vue";
import {computed, ref} from "vue";
import CommonUtil from "@/assets/js/commonUtil.js";

const props = defineProps({
	modelValue: {
		type: Array,
		required: true,
		default: () => []
	}
})

const emit = defineEmits(['update:modelValue'])
const bankList = computed({
	get: () => props.modelValue,
	set: (value) => {
		emit('update:modelValue', value)
	}
})
// 银行弹窗
const dialogVisible = ref(false);
const bankData = ref({});
const addBank = (index) => {
	bankData.value = {
		index: index || null,
		act: index >= 0 ? 'insert' : 'add',
		account: '',
		userName: '',
		bankName: '',
		openingBank: '',
		bankCode: '',
		remark: ''
	}
	dialogVisible.value = true
}
const bankEdit = (data, index) => {
	bankData.value = {
		index: index,
		act: 'edit',
		account: data.account,
		userName: data.userName,
		bankName: data.bankName,
		openingBank: data.openingBank,
		bankCode: data.bankCode,
		remark: data.remark
	}
	dialogVisible.value = true;
}
const bankDelete = (index) => {
	bankList.value.splice(index, 1)
}
const getBankData = (data) => {
	let bankData = CommonUtil.deepClone(data);
	delete bankData.index;
	delete bankData.act;
	if (data.act === 'add') {
		bankList.value.push(bankData)
	}
	if (data.act === 'insert') {
		bankList.value.splice(data.index + 1, 0, bankData)
	}
	if (data.act === 'edit') {
		bankList.value[data.index] = bankData
	}
}

</script>

<template lang="pug">
	el-table(:data="bankList" border stripe height="100%")
		template(#empty)
			el-link(type="success" @click="addBank") 添加银行卡
		el-table-column(label="序号" width="54" type="index" align="center")
		el-table-column(prop="account" label="银行账号")
		el-table-column(prop="userName" label="户名")
		el-table-column(prop="bankName" label="银行名称")
		el-table-column(prop="openingBank" label="开户行")
		el-table-column(prop="bankCode" label="行号")
		el-table-column(prop="remark" label="备注")
		el-table-column(label="操作" width="180")
			template(#default="{row, $index}")
				.tab-link
					el-button(text bg size="small" type="success" @click="addBank($index)") 添加
					el-button(text bg size="small" @click="bankEdit(row, $index)") 编辑
					el-button(text bg size="small" type="danger" @click="bankDelete($index)") 删除
	bank-dialog(v-model:visible="dialogVisible" :bank-data="bankData" @confirm="getBankData")
</template>

<style scoped lang="scss">

</style>
