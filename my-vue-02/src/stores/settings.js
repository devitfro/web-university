import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
const KEY = 'my-vue-02-settings'
function initial() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
export const useSettingsStore = defineStore('settings', () => {
  const saved = initial()
  const theme = ref(saved.theme === 'dark' ? 'dark' : 'light')
  const lang = ref(saved.lang || 'uk')
  const perPage = ref([5, 10, 20, 50].includes(saved.perPage) ? saved.perPage : 5)
  const filters = ref({ q: saved.filters?.q || '', artist: saved.filters?.artist || '' })
  const sort = ref({ by: saved.sort?.by || 'title', dir: saved.sort?.dir || 'asc' })
  watch([theme, lang, perPage, filters, sort], () => {
    localStorage.setItem(KEY, JSON.stringify({ theme: theme.value, lang: lang.value, perPage: perPage.value, filters: filters.value, sort: sort.value }))
  }, { deep: true, immediate: true })
  return { theme, lang, perPage, filters, sort }
})
