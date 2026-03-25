

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 1. 引入 Element Plus 和它的样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 2. 引入 Axios 并配置后端基础地址
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8080'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// 3. 全局注册 Element Plus
app.use(ElementPlus)

app.mount('#app')