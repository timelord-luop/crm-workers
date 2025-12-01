<script setup>
import {ref, onMounted, watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { Sunny, Moon, UserFilled, Edit, SwitchButton, Search, Bell} from '@element-plus/icons-vue'
import logo from '@/assets/img/logo.png'
import Http from "@/plugins/http.js";
import {ApiLogout} from "@/configuration/api/users.js";
import {TokenStorage} from "@/assets/js/storageUtil.js";

const router = useRouter()
const route = useRoute()

const isDark = ref(false)
const msgCount = ref(4)
const isCollapse = ref(false) // 菜单折叠
const defaultActive = ref('/home')
const breadcrumbData = ref([]);
const menuList = ref([
	{ id: '1', label: '仪表盘', path: '/home', icon: '📊' },
	{ id: '2', label: '客户管理', icon: '👥', children: [
			{id: '21', label: '客户列表', path: '/client-list'},
			{id: '22', label: '新增客户', path: '/client-md', editLabel: '编辑客户'},
			{id: '23', label: '基础设置', path: '/client-conf'},
		]},
	{ id: '3', label: '组织架构', icon: '🏢', children: [
			{id: '31', label: '员工管理', path: '/user', subset: [
					{label: '新增员工', editLabel: '编辑员工', path: '/user-md'}
				]},
			{id: '32', label: '部门管理', path: '/dept'},
			{id: '33', label: '职务管理', path: '/position'},
		]},
	{ id: '4', label: '系统设置', path: '/setting', icon: '⚙️' },
])

// 组件挂载时读取本地存储的主题设置
onMounted(() => {
	const saved = localStorage.getItem('admin-theme')
	if (saved === 'dark') {
		isDark.value = true
		document.documentElement.classList.add('dark')
	}
	if (route.path === '/') router.push('/home')
})
// 面包屑
watch(route, (newRoute) => {
	const path = newRoute.path;
	let breadcrumb = [];
	let defaultPath = '';
	menuList.value.forEach(item => {
		let obj = {name: `${item.icon} ${item.label}`, path: item?.path};
		if (item?.path === path || item.subset?.includes(path)) {
			breadcrumb.push(obj);
			defaultPath = obj.path;
		} else {
			if (item?.children) {
				item.children.forEach(child => {
					let findSub = null;
					if (child.subset) {
						findSub = child.subset.find(sub => sub.path === path);
					}
					if (child.path === path || findSub) {
						breadcrumb.push(obj);
						breadcrumb.push({name: `${newRoute.query.eid ? child.editLabel || child.label : child.label}`, path: child.path});
						if (findSub) {
							breadcrumb.push({name: `${newRoute.query.eid ? findSub.editLabel || findSub.label : findSub.label}`, path: findSub.path});
						}
						defaultPath = child.path;
					}
				})
			}
		}
	})
	breadcrumbData.value = breadcrumb;
	defaultActive.value = defaultPath;
}, { immediate: true }); // 立即执行一次以初始化面包屑数据
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
	if (command === 'logout') {
		Http.request(ApiLogout);
		TokenStorage.clearToken();
		router.push('/login')
	}
}
const menuChecked = (index) => {
	router.push(index)
}

</script>

<template lang="pug">
	.admin-layout(:class="{ dark: isDark }")
		section.header
			._left
				el-avatar(:size="30" shape="square" :src="logo" @click="isCollapse = !isCollapse")
				span._tit 羽翼CRM系统
				el-tag(type="primary") 四海兄弟有限公司
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
					:default-active="defaultActive",
					:default-openeds="['2']",
					:collapse="isCollapse",
					@select="menuChecked"
				)
					template(v-for="item in menuList" :key="item.id")
						el-sub-menu(:index="item.id" v-if="item.children")
							template(#title)
								._icon {{item.icon}}
								span {{item.label}}
							el-menu-item(v-for="child in item.children" :index="child.path") {{child.label}}
						el-menu-item(v-else, :index="item.path")
							._icon {{item.icon}}
							template(#title) {{item.label}}
			.main
				._breadcrumb
					el-breadcrumb(separator="/")
						el-breadcrumb-item(v-for="item in breadcrumbData" :to="item.path ? {path: item.path} : null") {{item.name}}
				._views
					router-view(v-slot="{ Component }")
						keep-alive
							component(:is="Component")
</template>

<style scoped lang="scss">
.admin-layout {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
}
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
		.el-avatar {
			background-color: initial;
		}
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
	display: flex;
	flex: 1;
	min-height: 0;
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
		._icon {
			width: 18px;
			height: 18px;
			font-size: 12px;
			display: flex;
			align-items: center;
			border-radius: 6px;
			border: 1px solid var(--border);
			justify-content: center;
			background-color: #f3f4f6;
			margin-right: 5px;
		}
	}
	.main {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 12px;
		width: 100%;
		overflow: hidden;
		background-color: var(--bg-color-mute);
		._breadcrumb {
			height: 20px;
			line-height: 20px;
			display: flex;
			align-items: center;
			:deep(.el-breadcrumb__item) {
				&:last-child {
					.el-breadcrumb__inner {
						font-weight: bold;
					}
				}
			}
		}
		._views {
			flex: 1;
			min-height: 0;
		}
	}
}
</style>
