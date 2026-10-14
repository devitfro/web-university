<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({ enabled: Boolean })
function beforeUnload(event) { if (!props.enabled) return; event.preventDefault(); event.returnValue = '' }
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>
<template></template>
