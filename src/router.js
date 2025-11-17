import {createRouter, createWebHistory} from 'vue-router'

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
export default router
