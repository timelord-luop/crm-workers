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
					path: '/leads',
					component: () => import('@/pages/admin/client/LeadsList.vue'),
				},{
					path: '/leads-md',
					component: () => import('@/pages/admin/client/OpportunityList.vue'),
				},{
					path: '/opportunity',
					component: () => import('@/pages/admin/client/OpportunityMd.vue'),
				},{
					path: '/opportunity-md',
					component: () => import('@/pages/admin/client/LeadsMd.vue'),
				},{
					path: '/client-conf',
					component: () => import('@/pages/admin/client/ClientConf.vue'),
				},{
					path: '/supplier',
					component: () => import('@/pages/admin/supplier/SupplierList.vue'),
				},{
					path: '/supplier-md',
					component: () => import('@/pages/admin/supplier/SupplierMd.vue'),
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
	const routerLoading = useRouterLoadingStore()
	if (to.path !== from.path) {
		routerLoading.startLoading()
	}
	next()
})
router.afterEach(() => {
	const routerLoading = useRouterLoadingStore()
	routerLoading.finishLoading()
})
export default router
