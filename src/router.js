import {createRouter, createWebHistory} from 'vue-router'
import {useRouterLoadingStore} from '@/store/sysStore'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/login',
			component: () => import('@/pages/Login.vue')
		},
		{
			path: '/',
			component: () => import('@/pages/admin/Menu.vue'),
			children: [
				{
					path: '/home',
					component: () => import('@/pages/admin/Home.vue'),
				},{
					path: '/setting',
					component: () => import('@/pages/admin/Setting.vue'),
				},{
					path: '/client-list',
					component: () => import('@/pages/admin/client/ClientList.vue'),
				},{
					path: '/client-md',
					component: () => import('@/pages/admin/client/ClientMd.vue'),
				},{
					path: '/client-conf',
					component: () => import('@/pages/admin/client/ClientConf.vue'),
				},{
					path: '/user',
					component: () => import('@/pages/admin/org/UserList.vue'),
				},{
					path: '/user-md',
					component: () => import('@/pages/admin/org/UserMd.vue'),
				},{
					path: '/dept',
					component: () => import('@/pages/admin/org/DeptList.vue'),
				},{
					path: '/position',
					component: () => import('@/pages/admin/org/PositionList.vue'),
				}
			]
		}
	]
})

router.beforeEach((to, from, next) => {
	// 只有在不同路由之间跳转时才显示加载
	const routerLoading = useRouterLoadingStore()
	if (to.path !== from.path) {
		routerLoading.startLoading()
	}
	next()
})
router.afterEach(() => {
	// 延迟隐藏，确保页面内容已加载
	const routerLoading = useRouterLoadingStore()
	// setTimeout(() => {
	// 	routerLoading.finishLoading()
	// }, 50)
	routerLoading.finishLoading()
})
export default router
