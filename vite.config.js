import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  	plugins: [vue()],
	resolve: {
		// 使用@路径
		alias: {
			'@': path.resolve('./src')
		}
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['vue', 'vue-router', 'pinia'],
					element: ['element-plus']
				}
			}
		},
		minify: 'esbuild',
		esbuild: {
			drop: ['console', 'debugger'], // 移除 console 和 debugger
			pure: ['console.log']          // 移除 console.log
		},
		sourcemap: false
	}
})
