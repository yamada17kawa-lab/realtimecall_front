import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  }
  ,
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  }
  ,
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  }
  ,
  {
    path: '/main',
    name: 'main',
    component: () => import('../views/MainView.vue')
  }
  ,
  {
    path: '/user/:id',
    name: 'user',
    component: () => import('../views/UserDetail.vue')
  }
  ,
  {
    path: '/myself',
    name: 'myself',
    component: () => import('../views/MyselfView.vue')
  }
  ,
  {
    path: '/friend/:id',
    name: 'friend',
    component: () => import('../views/FriendView.vue')
  }
  ,
  {
    path: '/videoCall/:roomId/:userId?',
    name: 'videoCall',
    component: () => import('../views/VideoCall.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
