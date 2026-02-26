<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div class="flex justify-between flex-wrap">
			<div class="flex-1">云台俯仰角</div>
			<div>{{ params.actionActuatorFuncParam.gimbalPitchRotateAngle }}°</div>
		</div>
		<div>
			<el-slider v-model="params.actionActuatorFuncParam.gimbalPitchRotateAngle" :min="-90" :max="30" :step="1"></el-slider>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { reactive, ref, watchEffect } from 'vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { ActionGroup } from '/@/types/wayline/waylineCreate';
import { drawSelectPointWedge } from '/@/utils/cesium/waylineUtil';
const props = defineProps<{
	value: ActionGroup;
}>();
console.log('云台俯仰角：', props.value);
const params = reactive(props.value);
watchEffect(() => {
	useWaylineStore().setPointActionActuatorFuncParam(params);
	drawSelectPointWedge({ pitchVal: params.actionActuatorFuncParam.gimbalPitchRotateAngle });
});
</script>
<script setup lang="ts"></script>

<style scoped></style>
