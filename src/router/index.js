import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue' 
import Projects from '../views/Projects.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects
    }
    
  ]
})

export default router