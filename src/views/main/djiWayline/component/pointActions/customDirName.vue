<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div>新文件夹名称</div>
		<div class="flex justify-between gap-2">
			<div class="break-all line-clamp-2">DJI_YYYYMMDDhhmm_XXX_{{ params.actionActuatorFuncParam.directoryName }}</div>
			<div v-if="!isEdit" class="i-material-symbols:edit cursor-pointer" @click="isEdit = true"></div>
		</div>
		<div v-if="isEdit" class="flex justify-between">
			<div class="flex-1">
				<el-input placeholder="请输入新文件夹名称" v-model="params.actionActuatorFuncParam.directoryName"> </el-input>
			</div>
			<div class="flex items-center gap-2 ml-2">
				<el-icon class="cursor-pointer c-green hover:op-70" @click="isEdit = false">
					<Check></Check>
				</el-icon>
				<el-icon
					class="cursor-pointer c-rose hover:op-70"
					@click="
						params.actionActuatorFuncParam.directoryName = '';
						isEdit = false;
					"
				>
					<Close></Close>
				</el-icon>
			</div>
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
console.log('创建文件夹：', props.value);
const isEdit = ref(false);
const params = reactive(props.value);
watchEffect(() => {
	useWaylineStore().setPointActionActuatorFuncParam(params);
});
</script>
<script setup lang="ts"></script>

<style scoped></style>
