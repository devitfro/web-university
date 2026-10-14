<script setup>
defineProps({ open: Boolean, title: String, busy: Boolean })
defineEmits(['close', 'confirm'])
</script>
<template><div v-if="open" class="overlay" @click.self="$emit('close')"><div class="modal" role="dialog" aria-modal="true"><h2>{{ title }}</h2><p><slot /></p><div class="actions"><button class="secondary" :disabled="busy" @click="$emit('close')">Скасувати</button><button class="danger" :disabled="busy" @click="$emit('confirm')">{{ busy ? 'Видалення...' : 'Підтвердити' }}</button></div></div></div></template>
