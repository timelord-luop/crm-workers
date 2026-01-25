<script setup>
import {computed, nextTick, onMounted, reactive, ref} from "vue";
import {Plus, Sort, Delete} from '@element-plus/icons-vue'
import CommonUtil from "@/assets/js/commonUtil.js";
import Sortable from "sortablejs";
import {ElMessage} from "element-plus";

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	fieldData: {
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

const committing = ref(false);
const formRef = ref();

const tableRef = ref();

const dialogData = ref({});

const onOpen = () => {
	nextTick(() => {
		committing.value = false;
		dialogData.value = CommonUtil.deepClone(props.fieldData);
		formRef.value?.resetFields()
		const tbody = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody')
		Sortable.create(tbody, {
			animation: 150,
			handle: '.drag-handle',
			onEnd(event) {
				const oldIndex = event.oldIndex
				const newIndex = event.newIndex
				// 交换数组数据
				const movedItem = dialogData.value.options.splice(oldIndex, 1)[0]
				dialogData.value.options.splice(newIndex, 0, movedItem)
			}
		})
	})
}

const rules = reactive({
	name: [{required: true, message: '请输入字段名', trigger: 'change'}],
	fieldType: [{required: true, message: '请选择字段类型', trigger: 'change'}],
	isRequired: [{required: true, message: '请选择是否必填', trigger: 'change'}],
	textType: [{required: true, message: '请选择文本类型', trigger: 'change'}],
	multiple: [{required: true, message: '请选择选项类型', trigger: 'change'}],
	options: [{required: true, message: '请添加选项值', trigger: 'change'}]
})
const toAddOption = () => {
	dialogData.value.options.push({
		idx: dialogData.value.options.length,
		val: '',
		isDefault: false
	})
}
const toDelOption = (index) => {
	dialogData.value.options.splice(index, 1);
	dialogData.value.options.forEach((item, idx) => {
		item.idx = idx;
	})
}
const multipleChange = (val) => {
  	if (val === 1) {
		dialogData.value.options.forEach(item => {
			item.isDefault = false;
		})
	}
}
const textTypeChange = (val) => {
	if (val === 4) {
		dialogData.value.unit = '元'
	} else {
		dialogData.value.unit = ''
	}
}
const defCheckChange = (val, index) => {
  	if (dialogData.value.multiple === 1 && val) {
		dialogData.value.options.forEach((item, idx) => {
			if (idx !== index) item.isDefault = false;
		})
	}
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return;
		if (dialogData.value.fieldType === 2) {
			if (!dialogData.value.options.length) {
				return ElMessage({
					showClose: true,
					message: '请添加选项值！',
					type: 'error',
				})
			}
			if (dialogData.value.options.some(item => !item.val)) {
				return ElMessage({
					showClose: true,
					message: '选项值不能存在空值！',
					type: 'error',
				})
			}
			if (CommonUtil.hasDuplicate(dialogData.value.options, 'val')) {
				return ElMessage({
					showClose: true,
					message: '选项值不能重复！',
					type: 'error',
				})
			}
		}
		emit('confirm', dialogData.value);
		committing.value = true;
		// setTimeout(() => {
		// 	committing.value = false;
		// }, 1000)
		dialogVisible.value = false;
	})
}

</script>

<template lang="pug">
	el-dialog(v-model="dialogVisible"
		width="500"
		draggable
		destroy-on-close
		:close-on-click-modal="false"
		@open="onOpen"
		:title="dialogData.act === 'edit' ? '编辑字段' : '添加字段'")
		el-form(
			ref="formRef"
			:model="dialogData"
			:rules="rules"
			@submit.prevent
			label-width="auto"
		)
			el-form-item(label="字段名" prop="name")
				el-input(v-model="dialogData.name" maxlength="22" placeholder="请输入" )
			el-form-item(label="字段类型" prop="fieldType")
				el-radio-group(v-model="dialogData.fieldType")
					el-radio(:value="1") 文本字段
					el-radio(:value="2") 选项字段
			el-form-item(label="是否必填" prop="isRequired")
				el-radio-group(v-model="dialogData.isRequired")
					el-radio(:value="2") 否
					el-radio(:value="1") 是
			el-form-item(label="文本类型" prop="textType" v-if="dialogData.fieldType === 1")
				el-radio-group(v-model="dialogData.textType" @change="textTypeChange")
					el-radio(:value="1") 单行文本
					el-radio(:value="2") 多行文本
					el-radio(:value="3") 数字
					el-radio(:value="4") 金额
			el-form-item(label="单位" prop="unit" v-if="dialogData.textType === 3")
				el-input(v-model="dialogData.unit" maxlength="4" placeholder="请输入" )
			el-form-item(label="选项类型" prop="multiple" v-if="dialogData.fieldType === 2")
				el-radio-group(v-model="dialogData.multiple" @change="multipleChange")
					el-radio(:value="1") 单选
					el-radio(:value="2") 多选
			el-form-item(label="输入提示词" v-if="dialogData.fieldType === 1")
				el-input(v-model="dialogData.placeholder" maxlength="64" placeholder="请输入" )
			el-form-item(label="选项值" class="is-required" v-show="dialogData.fieldType === 2")
				el-button._add_btn(:icon="Plus" size="small" plain, @click="toAddOption") 添加选项
				el-table(:data="dialogData.options"
					border
					size="small"
					ref="tableRef"
					row-key="idx"
					:show-header="false")
					el-table-column(prop="val" label="选项值")
						template(#default="{row, $index}")
							el-input(v-model="row.val" maxlength="64" size="small" :placeholder="'选项' + ($index + 1)" )
					el-table-column(prop="isDefault" label="是否默认" align="center" width="100" )
						template(#default="{row, $index}")
							el-checkbox(v-model="row.isDefault" @change="val => defCheckChange(val, $index)" label="设为默认" size="small")
					el-table-column(prop="sort" label="删除" align="center" width="40")
						template(#default="{row, $index}")
							el-link(type="info" :icon="Delete" underline="never" @click="toDelOption($index)")
					el-table-column(prop="sort" label="排序" align="center" width="40")
						template(#default="{row}")
							el-link.drag-handle(type="info" :icon="Sort" underline="never")
		template(#footer)
			el-button(@click="dialogVisible = false") 取消
			el-button(type="primary" :loading="committing" @click="toCommit(formRef)") 保存
</template>

<style scoped lang="scss">
._add_btn {
	margin: 5px 0 8px;
}
</style>
