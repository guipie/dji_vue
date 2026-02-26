<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div class="flex justify-between gap-4">
			<div>间隔时间(s):</div>
			<div class="flex-1">
				<el-input-number placeholder="间隔时间" :max="3000" :min="1" v-model="params.actionTrigger!.actionTriggerParam" style="width: 100%"> </el-input-number>
			</div>
		</div>
		<div class="flex justify-between">
			<div>
				<!-- 按钮多选框 -->
				<el-checkbox-group :disabled="params.actionActuatorFuncParam.useGlobalPayloadLensIndex" v-model="photoTypes">
					<el-checkbox-button value="visable" label="可见光"></el-checkbox-button>
					<el-checkbox-button value="ir" label="红外"></el-checkbox-button>
				</el-checkbox-group>
			</div>
			<el-button
				@click="params.actionActuatorFuncParam.useGlobalPayloadLensIndex = !params.actionActuatorFuncParam.useGlobalPayloadLensIndex"
				:type="params.actionActuatorFuncParam.useGlobalPayloadLensIndex ? 'primary' : 'default'"
				>使用全局设置</el-button
			>
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
console.log('定时拍照：', props.value);
var photoTypes = ref(props.value.actionActuatorFuncParam?.payloadLensIndex?.split(',') ?? []);
const params = reactive(props.value);
watchEffect(() => {
	params.actionActuatorFuncParam.payloadLensIndex = photoTypes.value.toString();
	useWaylineStore().setPointActionActuatorFuncParam(params);
});
</script>
<script setup lang="ts"></script>

<style scoped></style>
