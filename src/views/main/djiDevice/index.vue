<template>
	<div class="djiDevice-container">
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" ref="queryForm" labelWidth="90">
				<el-row>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10">
						<el-form-item label="关键字">
							<el-input v-model="queryParams.searchKey" clearable="" placeholder="请输入模糊查询关键字" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10">
						<el-form-item label="工作空间">
							<el-select clearable="" filterable="" v-model="queryParams.workspaceId" placeholder="请选择工作空间">
								<el-option v-for="(item, index) in djiWorkspaceWorkspaceIdDropdownList" :key="index" :value="item.value" :label="item.label" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="编号">
							<el-input v-model="queryParams.sn" clearable="" placeholder="请输入编号" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="名称">
							<el-input v-model="queryParams.model" clearable="" placeholder="请输入模型型号" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="昵称">
							<el-input v-model="queryParams.nick" clearable="" placeholder="请输入昵称" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="10" :xl="10" class="mb10">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery" v-auth="'djiDevice:page'"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="() => (queryParams = {})"> 重置 </el-button>
								<el-button icon="ele-ZoomIn" @click="changeAdvanceQueryUI" v-if="!showAdvanceQueryUI"> 高级 </el-button>
								<el-button icon="ele-ZoomOut" @click="changeAdvanceQueryUI" v-if="showAdvanceQueryUI"> 隐藏 </el-button>
							</el-button-group>

							<el-button-group style="margin-left: 20px">
								<el-button type="primary" icon="ele-Plus" @click="openAddDjiDevice" v-auth="'djiDevice:add'"> 新增 </el-button>
							</el-button-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>
		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" tooltip-effect="light" row-key="id" @sort-change="sortChange" border="">
				<el-table-column type="index" label="序号" width="55" align="center" />
				<el-table-column prop="sn" label="编号" width="200" show-overflow-tooltip="" />
				<el-table-column prop="nick" label="昵称" width="140" show-overflow-tooltip="" />
				<el-table-column prop="model" label="型号" width="140" show-overflow-tooltip="" />
				<el-table-column prop="workspaceId" label="工作空间" width="120" show-overflow-tooltip="">
					<template #default="scope">
						<span>{{ scope.row.workspaceIdNickName }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="domain" label="领域" width="140" show-overflow-tooltip="">
					<template #default="scope">
						<el-tag v-if="scope.row.domain">{{ getEnumDesc(scope.row.domain, getEnumDomainData_Index) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="type" label="主类型" width="140" show-overflow-tooltip="" />
				<el-table-column prop="subType" label="子类型" width="140" show-overflow-tooltip="" />
				<!-- <el-table-column prop="index" label="index" width="140" show-overflow-tooltip="" /> -->
				<el-table-column prop="longitude" label="经度" width="120" show-overflow-tooltip="" />
				<el-table-column prop="latitude" label="维度" width="120" show-overflow-tooltip="" />
				<el-table-column prop="altitude" label="高度" width="100" show-overflow-tooltip="" />
				<el-table-column prop="thingVersion" label="网关版本" width="140" show-overflow-tooltip="" />
				<el-table-column prop="firmwareVersion" label="固件版本" width="140" show-overflow-tooltip="" />
				<el-table-column prop="desc" label="desc" width="140" show-overflow-tooltip="" />
				<el-table-column prop="updateTime" label="修改时间" width="140" show-overflow-tooltip="" />
				<el-table-column label="操作" width="160" align="left" fixed="right" show-overflow-tooltip="" v-if="auth('djiDevice:edit') || auth('djiDevice:delete')">
					<template #default="scope">
						<el-button icon="ele-Edit" size="small" text="" type="primary" @click="openEditDjiDevice(scope.row)" v-auth="'djiDevice:edit'"> </el-button>
						<el-button icon="ele-Setting" v-if="scope.row.domain == DomainEnum.Dock" size="small" text="" type="primary" @click="openDebugDjiDevice(scope.row)" v-auth="'djiDevice:edit'"> </el-button>
						&nbsp;&nbsp;
						<el-dropdown placement="top-start">
							<el-button size="small" text="" type="primary" :loading="scope.row.loading">
								更多
								<el-icon><ArrowDownBold /></el-icon>
							</el-button>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item>
										<el-button icon="ele-Delete" size="small" text="" type="danger" @click="delDjiDevice(scope.row)" v-auth="'djiDevice:delete'"> 删除 </el-button>
									</el-dropdown-item>
									<el-dropdown-item>
										<el-button icon="ele-Connection" size="small" text="" type="primary" @click="bindDeviceWorkspace(scope.row)" v-auth="'djiDevice:bind'"> 绑定空间 </el-button>
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				v-model:currentPage="tableParams.page"
				v-model:page-size="tableParams.pageSize"
				:total="tableParams.total"
				:page-sizes="[10, 20, 50, 100, 200, 500]"
				small=""
				background=""
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				layout="total, sizes, prev, pager, next, jumper"
			/>
			<printDialog ref="printDialogRef" :title="printDjiDeviceTitle" @reloadTable="handleQuery" />
			<editDialog ref="editDialogRef" :title="editDjiDeviceTitle" @reloadTable="handleQuery" />
			<DockPropertySet v-model="propertyDialogValue" v-if="propertyDialogValue" :device="curDevice"></DockPropertySet>
		</el-card>
	</div>
</template>

<script lang="ts" setup="" name="djiDevice">
import { ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { auth } from '/@/utils/authFunction';
import { getDictDataItem as di, getDictDataList as dl } from '/@/utils/dict-utils';
import { formatDate } from '/@/utils/formatTime';

import printDialog from '/@/views/system/print/component/hiprint/preview.vue';
import editDialog from '/@/views/main/djiDevice/component/editDialog.vue';
import { pageDjiDevice, deleteDjiDevice } from '/@/api/main/djiDevice';
import { getDjiWorkspaceWorkspaceIdDropdown } from '/@/api/main/djiDevice';
import { getDjiDeviceParentSnDropdown } from '/@/api/main/djiDevice';

import commonFunction from '/@/utils/commonFunction';
import { getAPI } from '/@/utils/axios-utils';
import { SysEnumApi } from '/@/api-services';
import { ArrowDownBold } from '@element-plus/icons-vue'; // 正确的导入
import { bindWorkspace } from '/@/api/mainCloud/cloudDevice';
import { DomainEnum } from '/@/common/enums/deviceEnums';
import DockPropertySet from './component/dockPropertySet.vue';

const { getEnumDesc } = commonFunction();
const getEnumDomainData_Index = ref<any>([]);

const showAdvanceQueryUI = ref(false);
const printDialogRef = ref();
const editDialogRef = ref();
const loading = ref(false);
const propertyDialogValue = ref(false);
const curDevice = ref<any>(null);
const tableData = ref<any>([]);
const queryParams = ref<any>({});
const tableParams = ref({
	page: 1,
	pageSize: 15,
	total: 0,
});

const printDjiDeviceTitle = ref('');
const editDjiDeviceTitle = ref('');

const bindDeviceWorkspace = (row: any) => {
	row.loading = true;
	bindWorkspace(row.parentSn ?? row.sn, row.sn)
		.then((res) => {
			console.log(res);
			if (res.data.code === 200) {
				ElMessage.success('绑定成功');
				handleQuery();
			} else ElMessage.error(res.data.message ?? 'bind failed');
		})
		.finally(() => (row.loading = false));
};
// 改变高级查询的控件显示状态
const changeAdvanceQueryUI = () => {
	showAdvanceQueryUI.value = !showAdvanceQueryUI.value;
};

// 查询操作
const handleQuery = async () => {
	loading.value = true;
	var res = await pageDjiDevice(Object.assign(queryParams.value, tableParams.value));
	console.log('	tableData.value1:', res);
	tableData.value = res.data.result ?? [];
	tableParams.value.total = res.data.result?.total;
	console.log('	tableData.value:', tableData.value);
	loading.value = false;
	getEnumDomainData_Index.value = (await getAPI(SysEnumApi).apiSysEnumEnumDataListGet('DomainEnum')).data.result ?? [];
};

// 列排序
const sortChange = async (column: any) => {
	queryParams.value.field = column.prop;
	queryParams.value.order = column.order;
	await handleQuery();
};

// 打开新增页面
const openAddDjiDevice = () => {
	editDjiDeviceTitle.value = '添加设备';
	editDialogRef.value.openDialog({});
};

// 打开打印页面
const openPrintDjiDevice = async (row: any) => {
	printDjiDeviceTitle.value = '打印设备';
};

// 打开编辑页面
const openEditDjiDevice = (row: any) => {
	editDjiDeviceTitle.value = '编辑设备';
	editDialogRef.value.openDialog(row);
};
const openDebugDjiDevice = (row: any) => {
	curDevice.value = row;
	propertyDialogValue.value = true;
};
// 删除
const delDjiDevice = (row: any) => {
	ElMessageBox.confirm(`确定要删除吗?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await deleteDjiDevice(row);
			handleQuery();
			ElMessage.success('删除成功');
		})
		.catch(() => {});
};

// 改变页面容量
const handleSizeChange = (val: number) => {
	tableParams.value.pageSize = val;
	handleQuery();
};

// 改变页码序号
const handleCurrentChange = (val: number) => {
	tableParams.value.page = val;
	handleQuery();
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

handleQuery();
</script>
<style scoped>
:deep(.el-ipnut),
:deep(.el-select),
:deep(.el-input-number) {
	width: 100%;
}
</style>
