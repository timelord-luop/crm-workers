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
		// 打包成单文件模式
		rollupOptions: {
			output: {
				// 所有代码合并到单个文件
				manualChunks: undefined,
				inlineDynamicImports: true,
				entryFileNames: 'assets/js/[name].js',
				chunkFileNames: 'assets/js/[name].js',
				assetFileNames: 'assets/[ext]/[name].[ext]'
			}
		},
		// 构建优化
		cssCodeSplit: false, // 禁用CSS分割
		modulePreload: false, // 禁用模块预加载
		reportCompressedSize: false,
		// 压缩配置
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: ['console.log', 'console.info', 'console.warn'],
				passes: 2 // 压缩两次
			},
			format: {
				comments: false
			}
		},
		// 目标环境
		target: 'es2015',
		// 禁用sourcemap
		sourcemap: false,
	}
})
