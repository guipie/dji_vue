<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div class="flex justify-between flex-wrap gap-2">
			<div class="flex-1 w-80% overflow-unset">DJI_YYYYMMDDhhmm_XXX_{{ params.actionActuatorFuncParam.fileSuffix }}</div>
			<div v-if="!isEdit" class="i-material-symbols:edit cursor-pointer" @click="isEdit = true"></div>
		</div>
		<div v-if="isEdit" class="flex justify-between">
			<div class="flex-1">
				<el-input placeholder="请输入拍摄照片的后缀" v-model="params.actionActuatorFuncParam.fileSuffix"> </el-input>
			</div>
			<div class="flex items-center gap-2 ml-2">
				<el-icon class="cursor-pointer c-green hover:op-70" @click="isEdit = false">
					<Check></Check>
				</el-icon>
				<el-icon
					class="cursor-pointer c-rose hover:op-70"
					@click="
						params.actionActuatorFuncParam.fileSuffix = '';
						isEdit = false;
					"
				>
					<Close></Close>
				</el-icon>
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
import { Check, Close } from '@element-plus/icons-vue';
import { reactive, ref, watchEffect } from 'vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { ActionGroup } from '/@/types/wayline/waylineCreate';
const props = defineProps<{
	value: ActionGroup;
}>();
console.log('开始录像：', props.value);
const isEdit = ref(false);
var photoTypes = ref(props.value.actionActuatorFuncParam.payloadLensIndex.split(','));
const params = reactive(props.value);
watchEffect(() => {
	params.actionActuatorFuncParam.payloadLensIndex = photoTypes.value.toString();
	useWaylineStore().setPointActionActuatorFuncParam(params);
});
</script>
<script setup lang="ts"></script>

<style scoped></style>
