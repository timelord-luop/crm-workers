<script setup>
import { computed } from 'vue';

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	},
	kind: {
		type: String,
		default: 'receipt'
	},
	row: {
		type: Object,
		default: null
	}
});

const emit = defineEmits(['update:modelValue']);

const visible = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val)
});

const isReceipt = computed(() => props.kind === 'receipt');

const labels = computed(() => ({
	title: isReceipt.value ? '收款详情' : '付款详情',
	no: isReceipt.value ? '收款单号' : '付款单号',
	date: isReceipt.value ? '收款日期' : '付款日期',
	type: isReceipt.value ? '收款类型' : '付款类型',
	nature: isReceipt.value ? '收款性质' : '付款性质',
	amount: isReceipt.value ? '收款金额' : '付款金额',
	handler: isReceipt.value ? '收款人' : '付款人',
	account: isReceipt.value ? '收款账户' : '付款账户'
}));

const formatMoney = (val) => {
	const num = Number(val || 0);
	return num.toFixed(2);
};
</script>

<template>
	<el-dialog v-model="visible" width="560" draggable destroy-on-close :close-on-click-modal="false" :title="labels.title">
		<el-descriptions :column="2" border size="small" v-if="row">
			<el-descriptions-item :label="labels.no">{{ row.recordNo || '--' }}</el-descriptions-item>
			<el-descriptions-item :label="labels.date">{{ row.dateTimeText || '--' }}</el-descriptions-item>
			<el-descriptions-item :label="labels.type">{{ row.typeName || '--' }}</el-descriptions-item>
			<el-descriptions-item :label="labels.nature">{{ row.nature || '--' }}</el-descriptions-item>
			<el-descriptions-item label="收支类别">{{ row.category || '--' }}</el-descriptions-item>
			<el-descriptions-item label="状态">
				<el-tag v-if="Number(row.status) === 1" type="success" size="small">正常</el-tag>
				<el-tag v-else type="info" size="small">作废</el-tag>
			</el-descriptions-item>
			<el-descriptions-item label="往来单位">{{ row.counterpartyName || '--' }}</el-descriptions-item>
			<el-descriptions-item :label="labels.account">{{ row.accountText || '--' }}</el-descriptions-item>
			<el-descriptions-item :label="labels.amount">{{ formatMoney(row.amount) }}</el-descriptions-item>
			<el-descriptions-item :label="labels.handler">{{ row.handlerName || '--' }}</el-descriptions-item>
			<el-descriptions-item label="备注" :span="2">{{ row.remark || '--' }}</el-descriptions-item>
			<el-descriptions-item label="创建时间" :span="2">{{ row.createTimeText || '--' }}</el-descriptions-item>
		</el-descriptions>
	</el-dialog>
</template>
