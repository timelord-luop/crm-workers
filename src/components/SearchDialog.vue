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
		setTimeout(() => {
			inputRef.value.focus();
		}, 50)
		// 获取搜索历史
	})
}
const searchChange = (val) => {

}
</script>

<template lang="pug">
	el-dialog.__dialog(v-model="dialogVisible"
		width="520"
		top="8vh"
		destroy-on-close
		:close-on-click-modal="true"
		:show-close="false"
		:modal="false"
		@open="onOpen")
		.search-dialog
			.search-header
				el-input(v-model="searchValue"
					size="large"
					ref="inputRef"
					placeholder="从系统中搜索"
					:prefix-icon="Search"
					@change="searchChange"
					clearable)
			.search-body
				._empty 没有搜索历史
			.search-footer
				ul
					li
						kbd
							<svg width="15" height="15" aria-label="回车键" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M12 3.53088v3c0 1-1 2-2 2H4M7 11.53088l-3-3 3-3"></path></g></svg>
						span 选择
					li
						kbd
							<svg width="15" height="15" aria-label="向下键" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M7.5 3.5v8M10.5 8.5l-3 3-3-3"></path></g></svg>
						kbd
							<svg width="15" height="15" aria-label="向上键" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M7.5 11.5v-8M10.5 6.5l-3-3-3 3"></path></g></svg>
						span 切换
					li
						kbd
							<svg width="15" height="15" aria-label="Esc 键" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M13.6167 8.936c-.1065.3583-.6883.962-1.4875.962-.7993 0-1.653-.9165-1.653-2.1258v-.5678c0-1.2548.7896-2.1016 1.653-2.1016.8634 0 1.3601.4778 1.4875 1.0724M9 6c-.1352-.4735-.7506-.9219-1.46-.8972-.7092.0246-1.344.57-1.344 1.2166s.4198.8812 1.3445.9805C8.465 7.3992 8.968 7.9337 9 8.5c.032.5663-.454 1.398-1.4595 1.398C6.6593 9.898 6 9 5.963 8.4851m-1.4748.5368c-.2635.5941-.8099.876-1.5443.876s-1.7073-.6248-1.7073-2.204v-.4603c0-1.0416.721-2.131 1.7073-2.131.9864 0 1.6425 1.031 1.5443 2.2492h-2.956"></path></g></svg>
						span 关闭
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
		.el-input {
			font-size: 16px;
		}
	}
	.search-body {
		flex: 1;
        padding: 12px;
        overflow-y: auto;
		min-height: 90px;
		max-height: 260px;
		background-color: var(--bg-color-main);
		._empty {
			text-align: center;
			line-height: 70px;
			color: var(--secondary);
		}
	}
	.search-footer {
		height: 42px;
		width: 100%;
		box-shadow: var(--search-footer-shadow);
		ul {
			display: flex;
			list-style-type: none;
			align-items: center;
			height: 100%;
			padding: 0 15px;
			li {
				margin-right: 15px;
				color: var(--secondary);
				span {
					font-size: 12px;
				}
			}
			kbd {
				border-radius: 2px;
				background-color: var(--bg-color-mute);
				box-shadow: var(--search-footer-btn-shadow);
				display: inline-flex;
				height: 18px;
				justify-content: center;
				margin-right: .5em;
				padding: 2px 0 0;
				border: 0;
				width: 20px;
			}
		}
	}
}
</style>
