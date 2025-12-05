import {createApp, nextTick} from 'vue'
import router from './router.js'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/css/style.scss'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.mixin({
	mounted() {
		nextTick(() => {
			// 只在组件内绑定事件，避免对非 DOM 元素进行事件绑定
			const inputs = this.$el.querySelectorAll?.('input, textarea')
			inputs?.forEach(el => {
				// 缓存已处理过的元素，避免重复绑定事件
				if (el.__trimmed) return
				el.addEventListener('blur', function () {
					const vm = this.__vueParentComponent
					const val = vm.props.modelValue ?? ''
					// 去除前后空格并触发更新
					if (typeof val === 'string' && val.trim() !== val) {
						vm.emit('update:modelValue', val.trim())
						vm.emit('change', val.trim())
					}
				})
				// 标记元素已绑定过事件，避免重复绑定
				el.__trimmed = true
			})
		}).then(r => {})
	}
})

app.use(router)
app.use(createPinia())
app.use(ElementPlus, {
	locale: zhCn,
})
app.mount('#app')
