<template>
	<div id="waylinePointActionSetting" class="h-full flex-col-center">
		<div class="w-full flex-1"></div>
		<div class="w-100% h-30%"></div>
	</div>
</template>

<script setup lang="ts">
import { ActionGroup } from '/@/types/wayline/waylineCreate';

const props = defineProps<{
	action?: ActionGroup;
	heading?: number;
	pitch?: number;
}>();
</script>

<style scoped>
#waylinePointActionSetting > div {
	background: color-mix(in srgb, var(--el-color-primary), black 30%); /* 混合20%黑色使颜色更深 */
	/* 或者使用相对调整 */
	/* background: hsl(from var(--el-color-primary) h s calc(l - 10%)); */

	padding: 8px;
	border-bottom: 1px solid color-mix(in srgb, var(--el-color-primary), white 20%);
	color: white;
}
</style>
