<template>
  <div style="display:flex; align-items:center; justify-content:space-between; margin-top:12px; gap:12px;">
    <div>
      <button :disabled="page<=1" @click="emit('page', 1)">« Перша</button>
      <button :disabled="page<=1" @click="emit('page', page-1)">‹ Назад</button>
      <span style="margin:0 8px">Сторінка {{ page }} / {{ totalPages }}</span>
      <button :disabled="page>=totalPages" @click="emit('page', page+1)">Далі ›</button>
      <button :disabled="page>=totalPages" @click="emit('page', totalPages)">Остання »</button>
    </div>
    <div>
      <label>На сторінці: </label>
      <select :value="perPage" @change="emit('perPage', +$event.target.value)">
        <option v-for="n in [5,10,20,50,100]" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  page: { type: Number, required: true },
  perPage: { type: Number, required: true },
  total: { type: Number, required: true }
})
const emit = defineEmits(['page','perPage'])
const totalPages = computed(()=> Math.max(1, Math.ceil(props.total / props.perPage)))
</script>
