import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
const router = createRouter({ history: createWebHistory(), routes: [{ path: '/', component: () => import('./components/SongsPage.vue') }, { path: '/songs/new', component: () => import('./components/SongForm.vue') }, { path: '/songs/:id/edit', component: () => import('./components/SongForm.vue') }] })
createApp(App).use(createPinia()).use(router).mount('#app')
