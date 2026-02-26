<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div class="flex justify-between flex-wrap">
			<div class="flex-1">相机变焦倍率</div>
			<div>{{ params.actionActuatorFuncParam.focalLength }}X</div>
		</div>
		<div>
			<el-slider v-model="params.actionActuatorFuncParam.focalLength" :min="1" :max="56" :step="1"></el-slider>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { reactive, ref, watchEffect } from 'vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { ActionGroup } from '/@/types/wayline/waylineCreate';
const props = defineProps<{
	value: ActionGroup;
}>();
console.log('变焦：', props.value);
const params = reactive(props.value);
watchEffect(() => {
	useWaylineStore().setPointActionActuatorFuncParam(params);
});
</script>
<script setup lang="ts"></script>

<style scoped></style>
