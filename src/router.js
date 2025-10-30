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
			component: () => import('@/pages/admin/Home.vue')
		},
		{
			path: '/bom-update',
			component: () => import('@/pages/production/BomUpdate.vue')
		}, {
			path: '/users',
			component: () => import('@/pages/production/UserPage.vue')
		}
	]
})
export default router
