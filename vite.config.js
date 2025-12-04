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
		sourcemap: false,
		minify: 'esbuild',
		esbuild: {
			drop: ['console', 'debugger'], // 移除 console 和 debugger
			pure: ['console.log']          // 移除 console.log
		},
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['vue', 'vue-router', 'pinia', 'element-plus']
				}
			},
			plugins: [
				obfuscator({
					// ========== 核心混淆配置（最小性能影响） ==========
					compact: true,                       // 压缩代码（必须）
					identifierNamesGenerator: 'hexadecimal', // 变量名替换为16进制

					// ========== 全部禁用（性能优化） ==========
					controlFlowFlattening: false,        // ❌ 禁用：性能开销大
					deadCodeInjection: false,            // ❌ 禁用：显著影响性能
					debugProtection: false,              // ❌ 禁用：性能开销大
					debugProtectionInterval: 0,          // ❌ 禁用
					selfDefending: false,                // ❌ 禁用：性能开销大
					splitStrings: false,                 // ❌ 禁用：增加文件大小
					stringArrayEncoding: [],             // ❌ 禁用：性能开销
					numbersToExpressions: false,         // ❌ 禁用：性能开销

					// ========== 精简保留列表 ==========
					reservedNames: ['Vue', 'ElementPlus', 'router', 'store', 'axios'],

					// ========== 确保处理所有JS文件 ==========
					include: ['**/*.js', '**/*.ts']
				})
			]
		}
	}
})
