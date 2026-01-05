<template>
	<!-- 加载中动画容器 -->
	<div id="loadingOverlay">
		<div class="loading-spinner"></div>
		<div class="loading-text">地图加载中，请稍候...</div>
	</div>
	<div id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initCesium } from '/@/utils/cesium';
const props = defineProps<{
	options?: any;
}>();
onMounted(() => {
	initCesium(props.options);
});
</script>

<style scoped>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
html,
body {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
/* 加载中动画容器 - 全屏遮罩，居中显示 */
#loadingOverlay {
	position: fixed;
	top: 50px;
	left: 16%;
	width: 84%;
	height: 100vh;
	/**透明背景色 */
	background-color: rgba(255, 255, 255, 0.5);
	opacity: 0.6;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	z-index: 9999; /* 确保在Cesium容器上方 */
	transition: opacity 0.5s ease-out; /* 隐藏时平滑过渡 */
}
/* 加载动画样式 - 旋转圆圈 */
.loading-spinner {
	width: 50px;
	height: 50px;
	border: 5px solid #e0e0e0;
	border-top: 5px solid #1677ff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 15px;
}
/* 旋转动画关键帧 */
@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
/* 加载文本样式 */
.loading-text {
	font-size: 16px;
	color: var(--el-color-primary);
	font-family: 'Microsoft Yahei', sans-serif;
}
#cesiumContainer {
	width: 100%;
	height: 100%;
	min-height: 500px;
	position: relative;
}
</style>
