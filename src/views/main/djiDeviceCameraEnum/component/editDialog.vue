<template>
	<div class="djiDeviceCameraEnum-container">
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
						<el-form-item label="产品名称" prop="name">
							<el-input v-model="ruleForm.name" placeholder="请输入产品名称" maxlength="20" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="产品类型" prop="productType">
							<el-input v-model="ruleForm.productType" placeholder="请输入产品类型" maxlength="20" show-word-limit clearable />
							
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
						<el-form-item label="type-subtype-gimbalindex" prop="tsgIndex">
							<el-input v-model="ruleForm.tsgIndex" placeholder="请输入type-subtype-gimbalindex" maxlength="255" show-word-limit clearable />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="相机位置" prop="cameraPosition">
							<el-select clearable v-model="ruleForm.cameraPosition" placeholder="请选择相机位置">
								<el-option v-for="(item,index) in  getEnumCameraPositionData" :key="index" :value="item.value" :label="`[${item.value}] ${item.describe}`"></el-option>
								
							</el-select>
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="主云台" prop="isMainGimbal">
							<el-switch v-model="ruleForm.isMainGimbal" active-text="是" inactive-text="否" />
							
						</el-form-item>
						
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="备注" prop="desc">
							<el-input v-model="ruleForm.desc" placeholder="请输入备注" maxlength="2000" show-word-limit clearable />
							
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
	import { addDjiDeviceCameraEnum, updateDjiDeviceCameraEnum, detailDjiDeviceCameraEnum } from "/@/api/main/djiDeviceCameraEnum";
	import { getAPI } from '/@/utils/axios-utils';
	import { SysEnumApi } from '/@/api-services/api';

	const getEnumDomainData = ref<any>([]);
	const getEnumCameraPositionData = ref<any>([]);
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
		name: [{required: true, message: '请输入产品名称！', trigger: 'blur',},],
		productType: [{required: true, message: '请输入产品类型！', trigger: 'blur',},],
		tsgIndex: [{required: true, message: '请输入type-subtype-gimbalindex！', trigger: 'blur',},],
	});

	// 打开弹窗
	const openDialog = async (row: any) => {
		// ruleForm.value = JSON.parse(JSON.stringify(row));
		// 改用detail获取最新数据来编辑
		let rowData = JSON.parse(JSON.stringify(row));
		if (rowData.id)
			ruleForm.value = (await detailDjiDeviceCameraEnum(rowData.id)).data.result;
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
					await addDjiDeviceCameraEnum(values);
				} else {
					await updateDjiDeviceCameraEnum(values);
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







	// 页面加载时
	onMounted(async () => {
			getEnumDomainData.value = (await getAPI(SysEnumApi).apiSysEnumEnumDataListGet('DomainEnum')).data.result ?? [];
			getEnumCameraPositionData.value = (await getAPI(SysEnumApi).apiSysEnumEnumDataListGet('CameraPositionEnum')).data.result ?? [];
	});

	//将属性或者函数暴露给父组件
	defineExpose({ openDialog });
</script>




