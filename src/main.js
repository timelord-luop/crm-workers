import { createApp } from 'vue'
import router from './router.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/css/style.css'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
