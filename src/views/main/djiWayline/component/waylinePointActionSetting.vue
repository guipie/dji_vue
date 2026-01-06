<template>
	<div id="waylinePointActionSetting" class="h-full flex-col-center">
		<div class="w-full flex-1 text-lg">
			<div class="w-100% h-5% p-2 flex justify-between justify-center items-center" id="actionTop">
				<div class="flex-1 flex-center justify-start">
					<div class="w-26px h-26px" v-html="waylineSvgData.hover()"></div>
					<div>悬浮</div>
				</div>
				<div class="flex-1 flex-center">
					<div class="i-material-symbols:chevron-left"></div>
					<div>1-2</div>
					<div class="i-material-symbols:chevron-right"></div>
				</div>
				<div class="flex-1 flex-center justify-end">
					<span class="i-material-symbols:delete-outline"></span>
				</div>
			</div>
			<!-- 动作属性 -->
			<TakePhoto></TakePhoto>
		</div>
		<div class="w-100% h-30%" v-if="heading && pitch"></div>
	</div>
</template>

<script setup lang="ts">
import TakePhoto from './pointActions/takePhoto.vue';
import { ActionGroup } from '/@/types/wayline/waylineCreate';
import { waylineSvgData } from '/@/utils/data/waylineSvgData';

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
	border-bottom: 1px solid color-mix(in srgb, var(--el-color-primary), white 20%);
	color: white;
}
#actionTop {
	background: color-mix(in srgb, var(--el-color-primary), black 20%);
}
</style>
