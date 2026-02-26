<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div>
			<span>悬停时间(s): </span>
			<el-input-number placeholder="悬停时间" :max="3000" :min="1" v-model="params.actionActuatorFuncParam!.hoverTime"> </el-input-number>
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
console.log('悬停:', props.value);
const params = reactive(props.value);
watchEffect(() => {
	useWaylineStore().setPointActionActuatorFuncParam(params);
});
</script>
<script setup lang="ts"></script>

<style scoped></style>
