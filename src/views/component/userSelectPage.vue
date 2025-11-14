<template>
	<div>
		<el-button @click="visible = true" type="primary" link>选择用户</el-button>
		<div style="display: flex; gap: 5px">
			<el-tag v-for="(tag, index) in selectedUsers" :key="tag.id" closable :type="['success', 'danger', 'primary', 'warning', 'info'][index % 5]" @close="removeUser(tag)">
				{{ tag.nickName || tag.realName }}
			</el-tag>
		</div>
		<el-drawer v-model="visible" size="45%" :modal="false" modal-penetrable>
			<template #header="{ close, titleId, titleClass }">
				<h4 :id="titleId" :class="titleClass">选择用户</h4>
			</template>
			<div style="padding: 4px">
				<userPage :is-page="false" v-model:select-users="selectedUsers"></userPage>
			</div>
			<template #footer>
				<div class="drawer-footer" style="padding: 8px">
					<el-button @click="visible = false">取消</el-button>
					<el-button type="primary" @click="onConfirm"> 确 定 </el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref } from 'vue';
import userPage from '/@/views/system/user/index.vue';
import { SysUser } from '/@/api-services/models';
const props = defineProps({
	value: {
		type: Array as PropType<SysUser[]>,
		default: [],
	},
});
const visible = ref(false);
const selectedUsers = ref<SysUser[]>([]);
const emit = defineEmits(['update:value']);
function onConfirm() {
	console.log(selectedUsers.value);
	emit('update:value', selectedUsers.value);
	visible.value = false;
}
function removeUser(user: SysUser) {
	var index = selectedUsers.value.indexOf(user);
	if (index > -1) {
		selectedUsers.value.splice(index, 1);
	}
	emit('update:value', selectedUsers.value);
}
onMounted(() => {
	selectedUsers.value = props.value;
});
</script>

<style scoped></style>
