<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { getSongs, deleteSong } from '../api'
import { useSettingsStore } from '../stores/settings'
import Modal from './Modal.vue'
const settings = useSettingsStore()
const songs = ref([]), selected = ref([]), page = ref(1), error = ref(''), loading = ref(true), confirmOpen = ref(false), deleting = ref(false)
async function load() { loading.value = true; error.value = ''; try { songs.value = await getSongs() } catch { error.value = 'Не вдалося отримати композиції. Перевірте, чи запущено npm run server.' } finally { loading.value = false } }
onMounted(load)
const artists = computed(() => [...new Set(songs.value.map(s => s.artist))].sort((a,b) => a.localeCompare(b, 'uk')))
const filtered = computed(() => songs.value.filter(s => (!settings.filters.artist || s.artist === settings.filters.artist) && [s.title,s.artist,s.album,String(s.year)].some(v => v.toLowerCase().includes(settings.filters.q.toLowerCase().trim()))).sort((a,b) => { const x = a[settings.sort.by], y = b[settings.sort.by]; const result = typeof x === 'number' ? x-y : String(x).localeCompare(String(y),'uk'); return settings.sort.dir === 'asc' ? result : -result }))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / settings.perPage)))
const paged = computed(() => filtered.value.slice((page.value-1)*settings.perPage, page.value*settings.perPage))
watch([() => settings.filters.q, () => settings.filters.artist, () => settings.perPage, () => settings.sort.by, () => settings.sort.dir], () => { page.value = 1; selected.value = [] })
watch(pages, n => { if(page.value > n) page.value = n })
const allChecked = computed(() => paged.value.length > 0 && paged.value.every(s => selected.value.includes(String(s.id))))
function toggleAll(e) { const ids = paged.value.map(s => String(s.id)); selected.value = e.target.checked ? [...new Set([...selected.value,...ids])] : selected.value.filter(id => !ids.includes(id)) }
function toggle(id, checked) { id = String(id); selected.value = checked ? [...new Set([...selected.value,id])] : selected.value.filter(x => x !== id) }
function askDelete(id) { selected.value = [String(id)]; confirmOpen.value = true }
async function bulkDelete() { deleting.value = true; error.value = ''; try { const results = await Promise.allSettled(selected.value.map(deleteSong)); const failed = results.filter(r => r.status === 'rejected').length; if(failed) error.value = `Не вдалося видалити ${failed} запис(ів).`; else confirmOpen.value = false; selected.value = []; await load() } finally { deleting.value = false } }
</script>
<template>
<section class="hero"><div><span class="eyebrow">ВАША МУЗИЧНА БІБЛІОТЕКА</span><h1>Музична колекція</h1><p class="subtle">Керуйте композиціями, знаходьте улюблених виконавців і впорядковуйте записи.</p></div><RouterLink class="button" to="/songs/new">＋ Додати композицію</RouterLink></section>
<section class="panel"><div class="panel-head"><h2>Список композицій <span class="count">{{ filtered.length }}</span></h2><button v-if="selected.length" class="danger" @click="confirmOpen = true">Видалити вибрані ({{ selected.length }})</button></div>
<div class="filters"><label>Пошук<input v-model="settings.filters.q" placeholder="Назва, виконавець, альбом..." /></label><label>Виконавець<select v-model="settings.filters.artist"><option value="">Усі виконавці</option><option v-for="artist in artists" :key="artist">{{ artist }}</option></select></label><label>Сортувати за<select v-model="settings.sort.by"><option value="title">Назвою</option><option value="artist">Виконавцем</option><option value="album">Альбомом</option><option value="year">Роком</option></select></label><label>Порядок<select v-model="settings.sort.dir"><option value="asc">За зростанням</option><option value="desc">За спаданням</option></select></label></div>
<p v-if="error" class="error">{{ error }}</p><p v-if="loading">Завантаження...</p>
<div v-else class="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Вибрати всі на сторінці" :checked="allChecked" @change="toggleAll" /></th><th>Назва</th><th>Виконавець</th><th>Альбом</th><th>Рік</th><th>Дії</th></tr></thead><tbody><tr v-for="song in paged" :key="song.id"><td><input type="checkbox" :checked="selected.includes(String(song.id))" @change="toggle(song.id, $event.target.checked)" /></td><td class="song-name">{{ song.title }}</td><td>{{ song.artist }}</td><td>{{ song.album }}</td><td>{{ song.year }}</td><td class="table-actions"><RouterLink :to="`/songs/${song.id}/edit`">Редагувати</RouterLink><button class="link-danger" @click="askDelete(song.id)">Видалити</button></td></tr><tr v-if="!paged.length"><td colspan="6" class="empty">Композицій не знайдено.</td></tr></tbody></table></div>
<div class="pagination"><label>На сторінці: <select v-model.number="settings.perPage"><option :value="5">5</option><option :value="10">10</option><option :value="20">20</option><option :value="50">50</option></select></label><span class="subtle">Сторінка {{ page }} з {{ pages }}</span><button class="secondary" :disabled="page <= 1" @click="page--">← Назад</button><button class="secondary" :disabled="page >= pages" @click="page++">Далі →</button></div>
</section><Modal :open="confirmOpen" :busy="deleting" title="Підтвердження видалення" @close="confirmOpen = false" @confirm="bulkDelete">Видалити вибрані композиції ({{ selected.length }})? Цю дію неможливо скасувати.</Modal>
</template>
