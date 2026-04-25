import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': path.resolve('./src')
		}
	},
	build: {
		rollupOptions: {
			output: {
				// 强制合并策略
				manualChunks(id) {
					// 1. 将大库独立分包
					if (id.includes('node_modules/xlsx/')) {
						return 'xlsx-vendor';
					}
					if (id.includes('node_modules/exceljs/')) {
						return 'exceljs-vendor';
					}
					if (id.includes('@wangeditor')) {
						return 'wangeditor';
					}
					if (id.includes('element-plus')) {
						return 'element-plus';
					}
					if (id.includes('node_modules')) {
						// 将所有 node_modules 中的包合并到 vendor
						return 'vendor'
					}

					if (id.includes('src/')) {
						// 将所有业务代码合并到 app
						return 'app'
					}
				}
			}
		},
		minify: 'terser',
		esbuild: {
			drop: ['console', 'debugger'],
			pure: ['console.log']
		},
		sourcemap: false
	}
})
