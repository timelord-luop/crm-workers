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
				}
			]
		}
	]
})
export default router
