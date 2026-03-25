import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'

// 1. 配置后端基础地址
axios.defaults.baseURL = 'http://localhost:8080'

// 2. 添加 Axios 请求拦截器 (每次发请求前都会自动执行这里)
axios.interceptors.request.use(config => {
  // 从浏览器的本地缓存里取出 Token
  const token = localStorage.getItem('token')
  if (token) {
    // 如果有 Token，就自动把它挂在请求头的 Authorization 字段上
    config.headers['Authorization'] = token
  }
  return config
}, error => {
  return Promise.reject(error)
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')