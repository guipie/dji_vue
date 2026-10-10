<template>
	<el-select v-model="dataVal" value-key="workspaceId" clearable :placeholder="options?.placeholder" @change="selectChange">
		<el-option v-for="item in data" :key="item.workspaceId" :label="item.workspaceNickName" :value="item" />
	</el-select>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

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
const useWorkspace = useWorkspaceStore();
const data = computed(() => useWorkspace.mySpaces);
const dataVal = ref<any>({});
// onMounted(() => {
// 	useWorkspace.getSpaces();
// });

/**
 * 同步外部传入的 value
 * @description 空间列表是异步加载的，且外部可能回填（编辑场景）或清空（重置场景），
 * 因此列表长度与 value 变化时都要重新对齐选中项。
 */
watch(
	() => [props.value, data.value.length] as const,
	() => {
		const matched = props.value ? data.value.find((item: TypeWorkspace) => item.workspaceId.toString() === props.value) : useWorkspace.defSpace;
		if ((matched?.workspaceId ?? '') !== (dataVal.value?.workspaceId ?? '')) dataVal.value = matched ?? {};
	},
	{ immediate: true }
);

function selectChange(item: TypeWorkspace) {
	emit('update:id', item?.workspaceId ?? '');
	emit('update:name', item?.workspaceNickName ?? '');
}
</script>

<style scoped></style>
