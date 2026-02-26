<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div class="flex justify-between flex-wrap">
			<div class="flex-1">飞行器偏航角</div>
			<div>{{ params.actionActuatorFuncParam.aircraftHeading }}°</div>
		</div>
		<div>
			<el-slider v-model="params.actionActuatorFuncParam.aircraftHeading" :min="-180" :max="180" :step="1"></el-slider>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, watchEffect } from 'vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { ActionGroup } from '/@/types/wayline/waylineCreate';
import { drawSelectPointWedge } from '/@/utils/cesium/waylineUtil';
const props = defineProps<{
	value: ActionGroup;
}>();
console.log('飞行器偏航角：', props.value);
const params = reactive(props.value);
watchEffect(() => {
	useWaylineStore().setPointActionActuatorFuncParam(params);
	drawSelectPointWedge({ headingVal: params.actionActuatorFuncParam.aircraftHeading });
});
</script>
<script setup lang="ts"></script>

<style scoped></style>
