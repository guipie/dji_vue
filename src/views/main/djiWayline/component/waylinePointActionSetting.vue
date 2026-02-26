<template>
	<div id="waylinePointActionSetting" class="h-full flex-col-center">
		<div class="w-full flex-1 text-lg">
			<div class="w-100% h-5% p-2 flex flex-wrap justify-between justify-center items-center" id="actionTop">
				<div class="flex-0 flex justify-start">
					<div class="w-18px h-18px" v-html="svgData?.svg({ color: '#fff000', size: 18 })"></div>
					<div class="ml-2">{{ svgData?.label }}</div>
				</div>
				<div class="flex-1 flex-center">
					<div class="i-material-symbols:chevron-left"></div>
					<div>{{ (selectedPointIndex ?? 0) + 1 }}-{{ (selectedActionIndex ?? 0) + 1 }}</div>
					<div class="i-material-symbols:chevron-right"></div>
				</div>
				<div class="flex-0 flex cursor-pointer hover:op-70" @click="waylineStore.deleteSelectedPointAction()">
					<span class="i-material-symbols:delete-outline"></span>
				</div>
			</div>
			<!-- 动作属性 - 动态组件 -->
			<component :is="CurrentComponent" v-if="CurrentComponent" :value="curAction" />
			<!-- <TakePhoto v-if="curAction && curAction.actionActuatorFunc == 'takePhoto'" :value="curAction"></TakePhoto>
			<takePhotoMultipleTiming v-if="curAction && curAction.actionActuatorFunc == 'takePhotoMultipleTiming'" :value="curAction"></takePhotoMultipleTiming> -->
		</div>
		<div class="w-100% h-30%" v-if="heading && pitch"></div>
	</div>
</template>

<script setup lang="ts">
import { computed, shallowRef, watchEffect } from 'vue';
import { ActionGroup } from '/@/types/wayline/waylineCreate';
import { waylineActionData } from '/@/utils/data/waylineSvgData';
import { useWaylineStore } from '/@/stores/useWaylineStore';

const props = defineProps<{
	curAction: ActionGroup;
	heading?: number;
	pitch?: number;
}>();

// 使用 shallowRef 存储动态组件
const CurrentComponent = shallowRef<any>(null);

// 监听 action 类型变化并动态加载组件
watchEffect(async () => {
	if (props.curAction?.actionValue) {
		try {
			const actionType = props.curAction.actionValue;
			const componentModule = await import(`./pointActions/${props.curAction.actionTrigger ? actionType : 'empty'}.vue`);
			CurrentComponent.value = componentModule.default;
			console.log('success to load', props.curAction);
		} catch (error) {
			console.error(`Failed to load component: ${props.curAction.actionValue}`, error);
			CurrentComponent.value = null;
		}
	} else {
		CurrentComponent.value = null;
	}
});
const waylineStore = useWaylineStore();
const selectedPointIndex = computed(() => waylineStore.$state.selectedPointIndex);
const selectedActionIndex = computed(() => waylineStore.$state.selectedActionIndex);
const svgData = computed(() => waylineActionData.findLast((item) => item.actionFuncParam?.actionValue === props.curAction?.actionValue));
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
