import { createRouter, createWebHistory} from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Conversation.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path:'/ConversationManage',
    name: 'ConversationManage',
    component: () => import('../views/ConversationManage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
