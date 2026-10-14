<template>
  <div v-if="open" class="backdrop" @click.self="closeOnBackdrop">
    <div class="dialog" role="dialog" :aria-label="title">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
        <h3 style="margin:0">{{ title }}</h3>
        <button @click="emit('close')">×</button>
      </div>
      <div class="content">
        <slot />
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
        <button @click="emit('close')">Скасувати</button>
        <button @click="emit('confirm')">Підтвердити</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' }
})
const emit = defineEmits(['close', 'confirm'])

function onKey(e) {
  if (props.open && e.key === 'Escape') emit('close')
}
function closeOnBackdrop() { emit('close') }

onMounted(()=> window.addEventListener('keydown', onKey))
onBeforeUnmount(()=> window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; }
.dialog { background: #fff; padding: 16px; border-radius: 8px; min-width: 320px; max-width: 90vw; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
</style>
