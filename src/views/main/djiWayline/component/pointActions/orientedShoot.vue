<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div class="flex justify-between flex-wrap">
			<div class="flex-1 text-wrap line-clamp-1">DJI_YYYYMMDDhhmm_XXX_{{ params.fileSuffix }}</div>
			<div v-if="!isEdit" class="i-material-symbols:edit cursor-pointer" @click="isEdit = true"></div>
		</div>
		<div v-if="isEdit" class="flex justify-between">
			<div class="flex-1">
				<el-input placeholder="请输入拍摄照片的后缀" v-model="params.fileSuffix"> </el-input>
			</div>
			<div class="flex items-center gap-2 ml-2">
				<el-icon class="cursor-pointer c-green hover:op-70" @click="isEdit = false">
					<Check></Check>
				</el-icon>
				<el-icon
					class="cursor-pointer c-rose hover:op-70"
					@click="
						params.fileSuffix = '';
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
				<el-checkbox-group :disabled="params.useGlobalPayloadLensIndex" v-model="photoTypes">
					<el-checkbox-button value="visable" label="可见光"></el-checkbox-button>
					<el-checkbox-button value="ir" label="红外"></el-checkbox-button>
				</el-checkbox-group>
			</div>
			<el-button @click="params.useGlobalPayloadLensIndex = !params.useGlobalPayloadLensIndex" :type="params.useGlobalPayloadLensIndex ? 'primary' : 'default'">使用全局设置</el-button>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue';
import { reactive, ref, watchEffect } from 'vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
const props = defineProps<{
	value: any;
}>();
console.log('拍照：', props.value);
const isEdit = ref(false);
var photoTypes = ref(props.value.actionActuatorFuncParam.payloadLensIndex.split(','));
const params = reactive(props.value);
watchEffect(() => {
	useWaylineStore().setPointActionActuatorFuncParam({ ...params, ...{ payloadLensIndex: photoTypes.value.toString() } });
});
</script>
<script setup lang="ts"></script>

<style scoped></style>
