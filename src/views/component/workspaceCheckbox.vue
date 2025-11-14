<template>
	<el-checkbox-group v-model="dataVal" @change="selectChange">
		<el-checkbox :label="item.nickName" :value="item" v-for="item in data" />
	</el-checkbox-group>
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
const emit = defineEmits(['update:value']);
const useWorkspace = useStoreWorkspace();
const data = computed(() => useWorkspace.spaces);
const dataVal = ref({});
onMounted(() => {
	useWorkspace.getSpaces();
});
function selectChange(items: TypeWorkspace[]) {
	emit('update:value', items);
}
</script>

<style scoped></style>
