<template>
	<el-select v-model="dataVal" value-key="workspaceId" clearable :placeholder="options?.placeholder" @change="selectChange">
		<el-option v-for="item in data" :key="item.workspaceId" :label="item.nickName" :value="item" />
	</el-select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStoreWorkspace } from '/@/stores/workSpaceStore';

const props = defineProps({
	options: {
		type: Object,
		default: () => {},
	},
	value: {
		type: String,
		default: '',
	},
	name: {
		type: String,
		default: '',
	},
});
const emit = defineEmits(['update:id', 'update:name']);
const useWorkspace = useStoreWorkspace();
const data = computed(() => useWorkspace.spaces);
const dataVal = ref({});
onMounted(() => {
	useWorkspace.getSpaces();
});
function selectChange(item: TypeWorkspace) {
	emit('update:id', item.workspaceId);
	emit('update:name', item.nickName);
}
</script>

<style scoped></style>
