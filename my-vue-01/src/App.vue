<template>
  <main class="container">
    <header><div><p class="eyebrow">Лабораторна робота №3 · Варіант 12</p><h1>Музична колекція</h1><p class="subtitle">Керуйте власним каталогом пісень</p></div><span class="counter">{{ items.length }} композицій</span></header>
    <section class="panel"><h2>{{ isEdit ? 'Редагувати композицію' : 'Додати композицію' }}</h2>
      <form class="form" @submit.prevent="onSubmit" novalidate>
        <label>Назва пісні *<input v-model.trim="form.title" placeholder="Назва пісні" :class="{ invalid: errors.title }" /><small v-if="errors.title">{{ errors.title }}</small></label>
        <label>Виконавець *<input v-model.trim="form.artist" placeholder="Виконавець або гурт" :class="{ invalid: errors.artist }" /><small v-if="errors.artist">{{ errors.artist }}</small></label>
        <label>Альбом *<input v-model.trim="form.album" placeholder="Назва альбому" :class="{ invalid: errors.album }" /><small v-if="errors.album">{{ errors.album }}</small></label>
        <label>Рік випуску *<input v-model="form.year" type="number" min="1900" :max="maxYear" placeholder="2022" :class="{ invalid: errors.year }" /><small v-if="errors.year">{{ errors.year }}</small></label>
        <div class="actions"><button class="primary" type="submit" :disabled="saving">{{ saving ? 'Збереження…' : isEdit ? 'Зберегти зміни' : '+ Додати пісню' }}</button><RouterLink v-if="isEdit" to="/songs" class="cancel">Скасувати</RouterLink></div>
      </form>
    </section>
    <section class="panel"><div class="section-title"><h2>Список композицій</h2><span>{{ filtered.length }} знайдено</span></div>
      <div class="filters"><label>Пошук за назвою<input v-model="search" placeholder="Знайти пісню…" /></label><label>Фільтр за виконавцем<select v-model="artistFilter"><option value="">Усі виконавці</option><option v-for="artist in artists" :key="artist" :value="artist">{{ artist }}</option></select></label><label>Сортування<select v-model="sortBy"><option value="title">За назвою</option><option value="artist">За виконавцем</option><option value="year">За роком</option></select></label><button class="secondary" @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'">{{ sortDir === 'asc' ? '↑ За зростанням' : '↓ За спаданням' }}</button></div>
      <p v-if="loading">Завантаження…</p><p v-else-if="error" class="error">{{ error }} <button @click="load">Повторити</button></p>
      <template v-else><div class="table-wrap"><table><thead><tr><th>Назва</th><th>Виконавець</th><th>Альбом</th><th>Рік</th><th>Дії</th></tr></thead><tbody><tr v-for="song in paged" :key="song.id"><td class="song-title">{{ song.title }}</td><td>{{ song.artist }}</td><td>{{ song.album }}</td><td>{{ song.year }}</td><td class="row-actions"><RouterLink :to="`/songs/${song.id}/edit`">Редагувати</RouterLink><button @click="askDelete(song)">Видалити</button></td></tr><tr v-if="!paged.length"><td colspan="5" class="empty">Композицій не знайдено</td></tr></tbody></table></div><Pagination :page="page" :total="filtered.length" :perPage="perPage" @page="setPage" @perPage="setPerPage" /></template>
    </section>
    <Modal :open="confirmOpen" title="Видалити композицію?" @close="confirmOpen=false" @confirm="confirmDelete">Ви впевнені, що хочете видалити «{{ toDelete?.title }}»? Цю дію неможливо скасувати.</Modal>
  </main>
</template>
<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Pagination from './components/Pagination.vue'
import Modal from './components/Modal.vue'
import { Songs } from './api'
const route = useRoute(), router = useRouter()
const items = ref([]), loading = ref(false), saving = ref(false), error = ref('')
const search = ref(''), artistFilter = ref(''), sortBy = ref('title'), sortDir = ref('asc')
const page = ref(1), perPage = ref(5), confirmOpen = ref(false), toDelete = ref(null)
const maxYear = new Date().getFullYear() + 1
const form = reactive({ title: '', artist: '', album: '', year: '' })
const errors = reactive({ title: '', artist: '', album: '', year: '' })
const isEdit = computed(() => Boolean(route.params.id))
const artists = computed(() => [...new Set(items.value.map(s => s.artist))].sort((a,b) => a.localeCompare(b, 'uk')))
const filtered = computed(() => items.value.filter(s => (!artistFilter.value || s.artist === artistFilter.value) && (`${s.title}`.toLocaleLowerCase('uk').includes(search.value.trim().toLocaleLowerCase('uk')))).sort((a,b) => {
  const comparison = sortBy.value === 'year' ? Number(a.year) - Number(b.year) : String(a[sortBy.value]).localeCompare(String(b[sortBy.value]), 'uk')
  return sortDir.value === 'asc' ? comparison : -comparison
}))
const paged = computed(() => filtered.value.slice((page.value-1)*perPage.value, page.value*perPage.value))
watch([search, artistFilter, sortBy, sortDir], () => page.value = 1)
watch(() => route.params.id, async id => { clearForm(); if (id) await loadEdit(id) })
function clearForm() { Object.assign(form, {title:'', artist:'', album:'', year:''}); Object.keys(errors).forEach(k => errors[k]='') }
async function load() { loading.value=true; error.value=''; try { items.value=await Songs.list(); if (route.params.id) await loadEdit(route.params.id); page.value=Math.min(page.value,Math.max(1,Math.ceil(filtered.value.length/perPage.value))) } catch { error.value='Не вдалося завантажити дані. Перевірте JSON Server на порту 5174.' } finally { loading.value=false } }
async function loadEdit(id) { try { const song=await Songs.get(id); Object.assign(form,{title:song.title,artist:song.artist,album:song.album,year:song.year}) } catch { error.value='Композицію не знайдено'; await router.replace('/songs') } }
function validate() { Object.keys(errors).forEach(k=>errors[k]=''); for (const key of ['title','artist','album']) if (!String(form[key]).trim()) errors[key]='Обов’язкове поле'; const year=Number(form.year); if (form.year === '' || !Number.isInteger(year) || year<1900 || year>maxYear) errors.year=`Введіть рік від 1900 до ${maxYear}`; return !Object.values(errors).some(Boolean) }
async function onSubmit() { if (!validate()) return; saving.value=true; error.value=''; try { const data={title:form.title.trim(),artist:form.artist.trim(),album:form.album.trim(),year:Number(form.year)}; if (isEdit.value) { await Songs.update(route.params.id,data); await router.push('/songs') } else { await Songs.create(data); clearForm() } await load() } catch { error.value='Не вдалося зберегти композицію' } finally { saving.value=false } }
function askDelete(song) { toDelete.value=song; confirmOpen.value=true }
async function confirmDelete() { try { await Songs.remove(toDelete.value.id); confirmOpen.value=false; toDelete.value=null; await load() } catch { error.value='Не вдалося видалити композицію'; confirmOpen.value=false } }
function setPage(n) { page.value=Math.max(1,n) }
function setPerPage(n) { perPage.value=n; page.value=1 }
onMounted(load)
</script>
<style>
:root{font-family:Inter,system-ui,-apple-system,sans-serif;color:#202338;background:#f5f6fb;font-synthesis:none}*{box-sizing:border-box}body{margin:0}.container{max-width:1100px;margin:auto;padding:40px 20px 70px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:26px;gap:15px}h1{font-size:36px;margin:5px 0}h2{font-size:20px;margin:0 0 22px}.eyebrow{color:#6754d8;font-size:13px;font-weight:700}.subtitle{color:#73768c;margin:0}.counter{border-radius:25px;background:#eae6ff;color:#5844bc;padding:10px 16px;white-space:nowrap}.panel{background:white;border:1px solid #e8e9f1;border-radius:16px;padding:28px;margin-bottom:24px;box-shadow:0 8px 26px #25204708}.form{display:grid;grid-template-columns:1fr 1fr;gap:18px}.form label,.filters label{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:650}input,select{border:1px solid #d9dbe6;border-radius:9px;padding:11px 12px;font:inherit;color:#202338;background:white;width:100%;min-width:0}input:focus,select:focus{outline:2px solid #bcb0ff;border-color:#7c67ed}.invalid{border-color:#db4c67}small,.error{color:#bd3352}.actions{display:flex;align-items:center;gap:16px;grid-column:1/-1}button{font:inherit;cursor:pointer;border:0;border-radius:9px;padding:10px 15px}.primary{background:#6955d9;color:white;font-weight:650}.primary:disabled{opacity:.5}.cancel{color:#555a73}.section-title{display:flex;justify-content:space-between;align-items:center}.section-title span{font-size:13px;color:#7a7d91}.filters{display:grid;grid-template-columns:1.4fr 1fr 1fr auto;align-items:end;gap:12px;margin-bottom:22px}.secondary{background:#eeebff;color:#5542ba;white-space:nowrap}table{width:100%;border-collapse:collapse;text-align:left}th{background:#f7f7fc;color:#72758a;font-size:12px}th,td{padding:14px 12px;border-bottom:1px solid #ededf3}td{font-size:14px}.song-title{font-weight:700}.row-actions{white-space:nowrap}.row-actions a{color:#6955d9;text-decoration:none;margin-right:12px}.row-actions button{background:#fff0f2;color:#bf3653;padding:7px 10px}.table-wrap{overflow-x:auto}.empty{text-align:center;color:#898b9b;padding:32px}.panel button:focus-visible{outline:2px solid #7c67ed}@media(max-width:750px){.filters{grid-template-columns:1fr 1fr}.form{grid-template-columns:1fr}.container{padding:20px 12px}h1{font-size:28px}.panel{padding:18px}header{align-items:start;flex-direction:column}}
</style>
