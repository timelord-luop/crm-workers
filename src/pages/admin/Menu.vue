<script setup>
import { ref, onMounted } from 'vue'
import { Sunny, Moon, UserFilled, Edit, SwitchButton, Search, Bell} from '@element-plus/icons-vue'
import logo from '@/assets/img/logo.svg'

const isDark = ref(false)
const msgCount = ref(4)
const isCollapse = ref(false) // 菜单折叠
const menuList = ref([
	{ id: '1', label: '仪表盘', path: '/home', icon: 'House' },
	{ id: '2', label: '客户管理', path: '/client', icon: 'House', children: [
			{id: '21', label: '客户列表', path: '/client-list'},
			{id: '22', label: '新增客户', path: '/client-md'},
			{id: '23', label: '基础设置', path: '/client-conf'},
		]},
	{ id: '3', label: '组织架构', path: '/org', icon: 'House', children: [
			{id: '31', label: '员工管理', path: '/user'},
			{id: '32', label: '部门管理', path: '/dept'},
			{id: '33', label: '职务管理', path: '/position'},
		]},
	{ id: '4', label: '系统设置', path: '/setting', icon: 'House' },
])

// 组件挂载时读取本地存储的主题设置
onMounted(() => {
	const saved = localStorage.getItem('admin-theme')
	if (saved === 'dark') {
		isDark.value = true
		document.documentElement.classList.add('dark')
	}
})
// 切换主题
const toggleTheme = (val) => {
	isDark.value = val

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

const handleCommand = (command) => {

}

</script>

<template lang="pug">
	.admin-layout(:class="{ dark: isDark }")
		section.header
			._left
				el-avatar(:size="26" shape="square" :src="logo" @click="isCollapse = !isCollapse")
				span._tit 羽翼CRM系统
				el-tag(type="primary") 四海渔具 . 客户管理
			._right
				._search
					el-icon
						Search
					span._text 搜索
					el-tag(type="info") Ctrl K
				el-badge(:value="msgCount" :max="99")
					el-icon
						Bell
				el-switch(:active-action-icon="Moon",
					:inactive-action-icon="Sunny",
					v-model="isDark",
					size="default"
					@change="toggleTheme")
				._split
				._user
					el-dropdown(@command="handleCommand" trigger="click")
						._user_blo
							el-avatar(:size="24" :icon="UserFilled")
							._user_tag
								._name 王小二
								._name_org 海外事业部
						template(#dropdown)
							el-dropdown-menu
								el-dropdown-item(command="password" :icon="Edit") 修改密码
								el-dropdown-item(command="logout" :icon="SwitchButton") 退出登录
		section.content
			.menus
				el-menu(
					class="_el-menu-vertical"
					default-active="1",
					:default-openeds="['2']"
					:collapse="isCollapse"
				)
					template(v-for="item in menuList" :key="item.id")
						el-sub-menu(:index="item.id" v-if="item.children")
							template(#title)
								el-icon
									Moon
								span {{item.label}}
							el-menu-item(v-for="child in item.children" :index="child.id") {{child.label}}
						el-menu-item(v-else, :index="item.id")
							el-icon
								Moon
							template(#title) {{item.label}}
			.main
				._breadcrumb
				._views
					keep-alive
						router-view
</template>

<style scoped lang="scss">
.header {
	height: 50px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20px;
	border-bottom: 1px solid var(--border);
	backdrop-filter: blur(6px);
	._left {
		display: flex;
		align-items: center;
		._tit {
			font-size: 15px;
			margin-left: 10px;
			font-weight: bold;
		}
		.el-tag {
			margin-left: 10px;
			color: #6283df;
			font-weight: bold;
			border-radius: 8px;
		}
	}
	._right {
		display: flex;
		align-items: center;
		._search {
			padding: 3px 20px;
			border-radius: 25px;
			background-color: var(--bg-color-mute);
			display: flex;
			align-items: center;
			color: var(--secondary);
			cursor: pointer;
			margin-right: 20px;
			border: 1px solid rgba(0, 0, 0, 0);
			&:hover {
				border-color: var(--el-color-primary);
			}
			.el-icon {
				font-size: 17px;
				color: var(--text-color);
			}
			._text {
				margin: 0 10px;
			}
		}
		.el-badge {
			margin-right: 20px;
			margin-top: 4px;
			cursor: pointer;
			.el-icon {
				font-size: 16px;
				color: var(--text-color);
			}
			:deep(.el-badge__content) {
				top: -4px;
			}
		}
		.el-switch {
			--el-switch-on-color: var(--bg-color-mute);
			--el-switch-off-color: var(--bg-color-mute);
			:deep(.el-switch__action) {
				color: #2C2C2C;
			}
		}
		._split {
			width: 1px;
			height: 25px;
			background-color: var(--border);
			margin: 0 15px;
		}
		._user {
			cursor: pointer;
			._user_blo {
				display: flex;
				._user_tag {
					margin-left: 10px;
					font-size: 12px;
					text-align: center;
					._name_org {
						color: var(--secondary);
						margin-top: 5px;
					}
				}
			}
		}
	}
}
.content {
	height: calc(100vh - 52px);
	display: flex;
	.menus {
		overflow: hidden;
		._el-menu-vertical {
			height: 100%;
			overflow-y: auto;
		}
		._el-menu-vertical:not(.el-menu--collapse) {
			width: 180px;
		}
		:deep(.el-sub-menu__title) {
			height: 50px;
			line-height: 50px;
		}
		.el-menu-item {
			height: 50px;
			line-height: 50px;
		}
	}
	.main {
		flex: 1;
		padding: 10px;
		width: 100%;
		overflow: auto;
		background-color: var(--bg-color-main);
	}
}
</style>
