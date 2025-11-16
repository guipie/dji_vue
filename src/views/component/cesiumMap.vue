<template>
	<div id="cesiumContainer" style="min-width: 500px; min-height: 500px"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initCesium } from '/@/utils/cesium';

onMounted(() => {
	initCesium();
});
</script>

<style scoped></style>
