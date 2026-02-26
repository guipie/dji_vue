<template>
	<div id="pointActions">
		<div v-for="item in waylineActionData" class="flex items-center justify-start gap-1 hover:bg-bluegray cursor-pointer rounded-lg" :key="item.label" @click="actionClick(item)">
			<div v-html="item.svg({ color: '#F5FCF4', size: 28 })"></div>
			<div class="text-sm">{{ item.label }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { ActionDataType } from '/@/types/wayline/waylineCreate';
import { waylineActionData } from '/@/utils/data/waylineSvgData';
const waylieStore = useWaylineStore();
function actionClick(item: ActionDataType) {
	waylieStore.setPointAction(item.actionFuncParam!);
}
</script>

<style scoped>
#pointActions {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
</style>
