import { defineStore } from 'pinia'

// 用户信息状态
export const useUserStore = defineStore('userStore', {
	state: () => {
		return {
			userInfo: {}
		}
	},
	// 计算属性
	getters: {

	},
	// 赋值
	actions: {

	}
})

// 路由加载状态
export const useRouterLoadingStore = defineStore('routerLoading', {
	state: () => ({
		isLoading: false
	}),

	actions: {
		startLoading() {
			this.isLoading = true
		},
		finishLoading() {
			this.isLoading = false
		}
	},

	getters: {
		// 获取加载状态
		isRouteLoading: (state) => state.isLoading
	}
})
