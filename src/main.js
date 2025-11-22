import { createApp } from 'vue'
import router from './router.js'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/css/style.scss'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(ElementPlus, {
	locale: zhCn,
})
app.mount('#app')
