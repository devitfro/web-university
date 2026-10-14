import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Root from './Root.vue'
import App from './App.vue'
const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/songs', component: App },
  { path: '/songs/:id/edit', component: App },
  { path: '/', redirect: '/songs' },
  { path: '/:pathMatch(.*)*', redirect: '/songs' }
] })
createApp(Root).use(router).mount('#app')
