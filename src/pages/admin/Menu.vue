<script setup>
import { ref, onMounted } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

const isDark = ref(false)

// 切换主题
const toggleTheme = () => {
	isDark.value = !isDark.value

	if (isDark.value) {
		// 添加 dark 类 → Element Plus 组件自动变暗
		document.documentElement.classList.add('dark')
	} else {
		// 移除 dark 类 → Element Plus 组件自动变亮
		document.documentElement.classList.remove('dark')
	}

	// 持久化到本地存储
	localStorage.setItem('admin-theme', isDark.value ? 'dark' : 'light')
}

// 组件挂载时读取本地存储的主题设置
onMounted(() => {
	const saved = localStorage.getItem('admin-theme')
	if (saved === 'dark') {
		isDark.value = true
		document.documentElement.classList.add('dark')
	}
})
</script>

<template lang="pug">
	.admin-layout(:class="{ dark: isDark }")
		section.header
			el-button(@click="toggleTheme" :icon="isDark ? Sunny : Moon" type="text")
		section.menus

		section.content
			._breadcrumb
			._views
				keep-alive
					router-view
</template>

<style scoped lang="scss">
.header {
	height: 54px;
	display: flex;
	align-items: center;
	padding: 0 16px;
	border-bottom: 1px solid #EEEEEE;
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(6px);
}
.XSwitchTheme {
	.el-switch__action {
		background-color: transparent;
	}
}

::view-transition-new(root),
::view-transition-old(root) {
	animation: none;
	mix-blend-mode: normal;
}
.dark::view-transition-old(root) {
	z-index: 9999999999;
}
</style>
