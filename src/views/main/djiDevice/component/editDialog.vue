<template>
	<div class="djiDevice-container">
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
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="编号" prop="sn">
							<el-input v-model="ruleForm.sn" placeholder="请输入编号" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="名称" prop="model">
							<el-input v-model="ruleForm.model" placeholder="请输入模型，型号" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="工作空间" prop="workspaceId">
							<el-select clearable filterable v-model="ruleForm.workspaceId" placeholder="请选择工作空间">
								<el-option v-for="(item,index) in djiWorkspaceWorkspaceIdDropdownList" :key="index" :value="item.value" :label="item.label" />
								
							</el-select>
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="机场编号" prop="parentSn">
							<el-select clearable filterable v-model="ruleForm.parentSn" placeholder="请选择机场编号">
								<el-option v-for="(item,index) in djiDeviceParentSnDropdownList" :key="index" :value="item.value" :label="item.label" />
								
							</el-select>
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="昵称" prop="nick">
							<el-input v-model="ruleForm.nick" placeholder="请输入昵称" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="领域" prop="domain">
							<el-select clearable v-model="ruleForm.domain" placeholder="请选择领域">
								<el-option v-for="(item,index) in  getEnumDomainData" :key="index" :value="item.value" :label="`[${item.value}] ${item.describe}`"></el-option>
								
							</el-select>
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="主类型" prop="type">
							<el-input v-model="ruleForm.type" placeholder="请输入主类型" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="子类型" prop="subType">
							<el-input v-model="ruleForm.subType" placeholder="请输入子类型" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="index" prop="index">
							<el-input v-model="ruleForm.index" placeholder="请输入index" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="网关版本" prop="thingVersion">
							<el-input v-model="ruleForm.thingVersion" placeholder="请输入网关版本" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="固件版本" prop="firmwareVersion">
							<el-input v-model="ruleForm.firmwareVersion" placeholder="请输入固件版本" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="desc" prop="desc">
							<el-input v-model="ruleForm.desc" placeholder="请输入desc" maxlength="2000" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="经度" prop="longitude">
							<el-input v-model="ruleForm.longitude" placeholder="请输入经度" maxlength="0" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="维度" prop="latitude">
							<el-input v-model="ruleForm.latitude" placeholder="请输入维度" maxlength="0" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="高度" prop="altitude">
							<el-input v-model="ruleForm.altitude" placeholder="请输入高度" maxlength="0" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="bind_time" prop="bindTime">
							<el-date-picker v-model="ruleForm.bindTime" type="date" placeholder="bind_time" />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="binded" prop="binded">
							<el-switch v-model="ruleForm.binded" active-text="是" inactive-text="否" />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="avatar_url" prop="avatarUrl">
							<el-upload
							list-type="picture-card"
							:show-file-list="false"
							:http-request="uploadAvatarUrlHandle">
								<img
								v-if="ruleForm.avatarUrl"
								:src="ruleForm.avatarUrl"
								@click="ruleForm.avatarUrl=''"
								style="width: 100%; height: 100%; object-fit: contain"/>
								<el-icon v-else><Plus /></el-icon>
								
							</el-upload>
							
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
	import { ref,onMounted } from "vue";
	import { getDictDataItem as di, getDictDataList as dl } from '/@/utils/dict-utils';
	import { ElMessage } from "element-plus";
	import type { FormRules } from "element-plus";
    import { Plus } from "@element-plus/icons-vue";
    import { UploadRequestOptions } from "element-plus";
    import {uploadAvatarUrl} from '/@/api/main/djiDevice';
	import { addDjiDevice, updateDjiDevice, detailDjiDevice } from "/@/api/main/djiDevice";
	import { getDjiWorkspaceWorkspaceIdDropdown } from '/@/api/main/djiDevice';
	import { getDjiDeviceParentSnDropdown } from '/@/api/main/djiDevice';
	import { getAPI } from '/@/utils/axios-utils';
	import { SysEnumApi } from '/@/api-services/api';

	const getEnumDomainData = ref<any>([]);
	//父级传递来的参数
	var props = defineProps({
		title: {
		type: String,
		default: "",
	},
	});
	//父级传递来的函数，用于回调
	const emit = defineEmits(["reloadTable"]);
	const ruleFormRef = ref();
	const isShowDialog = ref(false);
	const ruleForm = ref<any>({});
	//自行添加其他规则
	const rules = ref<FormRules>({
		sn: [{required: true, message: '请输入编号！', trigger: 'blur',},],
		model: [{required: true, message: '请输入型号！', trigger: 'blur',},],
	});

	// 打开弹窗
	const openDialog = async (row: any) => {
		// ruleForm.value = JSON.parse(JSON.stringify(row));
		// 改用detail获取最新数据来编辑
		let rowData = JSON.parse(JSON.stringify(row));
		if (rowData.id)
			ruleForm.value = (await detailDjiDevice(rowData.id)).data.result;
		else
			ruleForm.value = rowData;
		isShowDialog.value = true;
	};

	// 关闭弹窗
	const closeDialog = () => {
		emit("reloadTable");
		isShowDialog.value = false;
	};

	// 取消
	const cancel = () => {
		isShowDialog.value = false;
	};

	// 提交
	const submit = async () => {
		ruleFormRef.value.validate(async (isValid: boolean, fields?: any) => {
			if (isValid) {
				let values = ruleForm.value;
				if (ruleForm.value.id == undefined || ruleForm.value.id == null || ruleForm.value.id == "" || ruleForm.value.id == 0) {
					await addDjiDevice(values);
				} else {
					await updateDjiDevice(values);
				}
				closeDialog();
			} else {
				ElMessage({
					message: `表单有${Object.keys(fields).length}处验证失败，请修改后再提交`,
					type: "error",
				});
			}
		});
	};

	const djiWorkspaceWorkspaceIdDropdownList = ref<any>([]); 
	const getDjiWorkspaceWorkspaceIdDropdownList = async () => {
		let list = await getDjiWorkspaceWorkspaceIdDropdown();
		djiWorkspaceWorkspaceIdDropdownList.value = list.data.result ?? [];
	};
	getDjiWorkspaceWorkspaceIdDropdownList();
	
	const djiDeviceParentSnDropdownList = ref<any>([]); 
	const getDjiDeviceParentSnDropdownList = async () => {
		let list = await getDjiDeviceParentSnDropdown();
		djiDeviceParentSnDropdownList.value = list.data.result ?? [];
	};
	getDjiDeviceParentSnDropdownList();
	




	const uploadAvatarUrlHandle = async (options: UploadRequestOptions) => {
		const res = await uploadAvatarUrl(options);
		ruleForm.value.avatarUrl = res.data.result?.url;
	};


	// 页面加载时
	onMounted(async () => {
			getEnumDomainData.value = (await getAPI(SysEnumApi).apiSysEnumEnumDataListGet('DomainEnum')).data.result ?? [];
	});

	//将属性或者函数暴露给父组件
	defineExpose({ openDialog });
</script>




