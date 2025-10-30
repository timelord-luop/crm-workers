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
	}
})
