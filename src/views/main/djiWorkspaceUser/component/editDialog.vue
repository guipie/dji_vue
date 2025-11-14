<template>
	<div class="djiWorkspaceUser-container">
		<el-dialog v-model="isShowDialog" :width="800" draggable="">
			<template #header>
				<div style="color: #fff">
					<!--<el-icon size="16" style="margin-right: 3px; display: inline; vertical-align: middle"> <ele-Edit /> </el-icon>-->
					<span>{{ props.title }}</span>
				</div>
			</template>
			<el-form :model="ruleForm" ref="ruleFormRef" label-width="auto" :rules="rules">
				<el-row :gutter="35">
					<el-form-item v-show="false">
						<el-input v-model="ruleForm.id" />
					</el-form-item>
					<el-col class="mb20">
						<el-form-item label="" prop="selectUsers">
							<user-select-page v-model:value="ruleForm.selectUsers" :key="ruleForm.selectUsers"></user-select-page>
						</el-form-item>
					</el-col>
					<el-col class="mb20">
						<el-form-item label="配置空间:" prop="selectWorkspaces">
							<workspace-checkbox v-model="ruleForm.selectWorkspaces"></workspace-checkbox>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取 消</el-button>
					<el-button type="primary" @click="submit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>
<style scoped>
:deep(.el-select),
:deep(.el-input-number) {
	width: 100%;
}
</style>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getDictDataItem as di, getDictDataList as dl } from '/@/utils/dict-utils';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { addDjiWorkspaceUser, updateDjiWorkspaceUser, detailDjiWorkspaceUser, setDjiWorkspaceUser } from '/@/api/main/djiWorkspaceUser';
import { getSysUserUserIdDropdown } from '/@/api/main/djiWorkspaceUser';
import UserSelectPage from '/@/views/component/userSelectPage.vue';
import WorkspaceCheckbox from '/@/views/component/workspaceCheckbox.vue';

//父级传递来的参数
var props = defineProps({
	title: {
		type: String,
		default: '',
	},
});
//父级传递来的函数，用于回调
const emit = defineEmits(['reloadTable']);
const ruleFormRef = ref();
const isShowDialog = ref(false);
const ruleForm = ref<any>({});
//自行添加其他规则
const rules = ref<FormRules>({
	selectUsers: [{ required: true, message: '请选择用户', trigger: 'blur' }],
	selectWorkspaces: [{ required: true, message: '请选择空间', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = async (row: any) => {
	// ruleForm.value = JSON.parse(JSON.stringify(row));
	// 改用detail获取最新数据来编辑
	let rowData = JSON.parse(JSON.stringify(row));
	console.log('row:', rowData);
	if (rowData.userId) {
		ruleForm.value.selectUsers = [];
		ruleForm.value.selectUsers = [
			{
				nickName: rowData.nickName,
				id: rowData.userId,
				account: rowData.account,
			},
		];
	} else ruleForm.value = rowData;
	isShowDialog.value = true;
};

// 关闭弹窗
const closeDialog = () => {
	emit('reloadTable');
	isShowDialog.value = false;
};

// 取消
const cancel = () => {
	isShowDialog.value = false;
};

// 提交
const submit = async () => {
	ruleFormRef.value.validate(async (isValid: boolean, fields?: any) => {
		let values = ruleForm.value;
		console.log(values);
		if (isValid && values.selectUsers.length > 0 && values.selectWorkspaces.length > 0) {
			await setDjiWorkspaceUser({
				userIds: values.selectUsers.map((item: any) => item.id),
				workspaceIds: values.selectWorkspaces.map((item: any) => item.workspaceId),
			});
			closeDialog();
		} else {
			ElMessage({
				message: `表单有${Object.keys(fields).length}处验证失败，请修改后再提交`,
				type: 'error',
			});
		}
	});
};

const sysUserUserIdDropdownList = ref<any>([]);
const getSysUserUserIdDropdownList = async () => {
	let list = await getSysUserUserIdDropdown();
	sysUserUserIdDropdownList.value = list.data.result ?? [];
};
getSysUserUserIdDropdownList();

// 页面加载时
onMounted(async () => {});

//将属性或者函数暴露给父组件
defineExpose({ openDialog });
</script>
