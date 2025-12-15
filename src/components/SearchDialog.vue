<script setup>
import {computed, nextTick, ref} from "vue";
import {Search} from '@element-plus/icons-vue'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	}
})
const emit = defineEmits(['update:visible'])
const dialogVisible = computed({
	get: () => props.visible,
	set: (val) => emit('update:visible', val)
})
const inputRef = ref();
const searchValue = ref('');
const onOpen = () => {
	nextTick(() => {
		// 获取搜索历史
	})
}
</script>

<template lang="pug">
	el-dialog.__dialog(v-model="dialogVisible"
		width="520"
		destroy-on-close
		:close-on-click-modal="true"
		:show-close="false"
		:modal="false"
		@open="onOpen")
		.search-dialog
			.search-header
				el-input(v-model="searchValue" size="large" ref="inputRef" :prefix-icon="Search" clearable)
			.search-body
				span 44
			.search-footer
				span 2
</template>

<style scoped lang="scss">
.search-dialog {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	//border-radius: 8px;
	.search-header {
		padding: 12px;
		background-color: var(--bg-color-main);
	}
	.search-body {
		flex: 1;
        padding: 12px;
        overflow-y: auto;
		min-height: 120px;
		max-height: 360px;
		background-color: var(--bg-color-main);
	}
	.search-footer {
		height: 42px;
		width: 100%;
		box-shadow: var(--search-footer-shadow)
	}
}
</style>
