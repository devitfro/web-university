<script setup>
import { watchEffect } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useSettingsStore } from './stores/settings'
const settings = useSettingsStore()
watchEffect(() => { document.documentElement.dataset.theme = settings.theme })
</script>
<template>
  <header class="topbar"><RouterLink class="brand" to="/">♫ Музична колекція</RouterLink><div class="header-actions"><span class="subtle">ЛР №4 · Варіант 12</span><button class="secondary" @click="settings.theme = settings.theme === 'light' ? 'dark' : 'light'">{{ settings.theme === 'light' ? '☾ Темна тема' : '☀ Світла тема' }}</button></div></header>
  <main class="container"><RouterView /></main>
</template>
