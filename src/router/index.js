import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue' 
import Projects from '../views/Projects.vue'
import TaskBoard from '../views/TaskBoard.vue'

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
    },
    {
      path: '/project/:id',
      name: 'taskBoard',
      component: TaskBoard
    }
    
  ]
})

export default router