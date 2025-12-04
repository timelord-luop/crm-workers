import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import obfuscator from 'rollup-plugin-obfuscator'

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
			},
			plugins: [
				process.env.NODE_ENV === 'production' && obfuscator({
					// 轻度混淆配置
					compact: true,
					identifierNamesGenerator: 'mangled', // 更简单的混淆
					reservedNames: ['^Vue', '^El', '^\\$', '^_'],
					// 只处理业务代码文件
					include: [
						'src/**/*.js',
						'src/**/*.ts',
						'src/**/*.vue'
					],
					// 排除第三方库
					exclude: [
						'node_modules/**',
						'**/vendor/**'
					],
					// 性能优化
					controlFlowFlattening: false,
					deadCodeInjection: false,
					debugProtection: false
				})
			].filter(Boolean)
		},
		minify: 'esbuild',
		esbuild: {
			drop: ['console', 'debugger'], // 移除 console 和 debugger
			pure: ['console.log']          // 移除 console.log
		},
		sourcemap: false
	}
})
