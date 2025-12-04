import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import obfuscator from 'rollup-plugin-obfuscator'

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': path.resolve('./src')
		}
	},
	build: {
		sourcemap: false,
		minify: 'esbuild',
		esbuild: {
			drop: ['console', 'debugger'],
			pure: ['console.log']
		},
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['vue', 'vue-router', 'pinia', 'element-plus']
				},
				// 确保输出文件路径正确
				chunkFileNames: 'assets/[name]-[hash].js',
				entryFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
			},
			plugins: [
				obfuscator({
					// ========== 核心混淆配置 ==========
					compact: true,
					identifierNamesGenerator: 'hexadecimal',

					// ========== 关键修复：保留路径字符串 ==========
					stringArray: false,           // ❗ 必须禁用：避免路径被放入字符串数组
					renameProperties: false,      // ❗ 必须禁用：避免属性名被修改
					transformObjectKeys: false,   // ❗ 必须禁用：避免对象键名被修改

					// ========== 禁用高开销功能 ==========
					controlFlowFlattening: false,
					deadCodeInjection: false,
					debugProtection: false,
					debugProtectionInterval: 0,
					selfDefending: false,
					splitStrings: false,
					stringArrayEncoding: [],
					numbersToExpressions: false,

					// ========== 保留列表（包含路径相关） ==========
					reservedNames: [
						'Vue', 'ElementPlus', 'router', 'store', 'axios',
						// 保留可能被动态导入使用的变量名
						'import', 'require', 'Promise', 'resolve'
					],

					// ========== 保留路径相关字符串 ==========
					reservedStrings: [
						'@/',
						'src/',
						'.vue',
						'.js',
						'.ts',
						'/pages/',
						'/components/',
						'pages/',
						'components/'
					],

					// ========== 确保处理文件但不修改路径 ==========
					include: ['**/*.js', '**/*.ts'],

					// ========== 排除可能包含动态导入的文件 ==========
					exclude: [
						// 不处理可能包含动态导入的字符串字面量
						/['"]@\/.*?['"]/,
						/import\s*\(['"](.*?)['"]\)/,
					],

					// ========== 其他重要设置 ==========
					unicodeEscapeSequence: false, // 禁用Unicode转义
					target: 'browser'             // 确保浏览器兼容
				})
			]
		}
	}
})
