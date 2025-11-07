<template>
	<div class="djiDeviceCameraEnum-container">
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" ref="queryForm" labelWidth="90">
				<el-row>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10">
						<el-form-item label="关键字">
							<el-input v-model="queryParams.searchKey" clearable="" placeholder="请输入模糊查询关键字" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="产品名称">
							<el-input v-model="queryParams.name" clearable="" placeholder="请输入产品名称" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="领域">
							<el-select clearable="" v-model="queryParams.domain" placeholder="请选择领域">
								<el-option v-for="(item, index) in getEnumDomainData_Index" :key="index" :value="item.value" :label="`[${item.value}] ${item.describe}`" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="tsgIndex">
							<el-input v-model="queryParams.tsgIndex" clearable="" placeholder="请输入type-subtype-gimbalindex" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI"> </el-col>
					<el-col :xs="24" :sm="20" :md="20" :lg="14" :xl="8" class="mb10">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery" v-auth="'djiDeviceCameraEnum:page'"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="() => (queryParams = {})"> 重置 </el-button>
								<el-button icon="ele-ZoomIn" @click="changeAdvanceQueryUI" v-if="!showAdvanceQueryUI"> 高级 </el-button>
								<el-button icon="ele-ZoomOut" @click="changeAdvanceQueryUI" v-if="showAdvanceQueryUI"> 隐藏 </el-button>
							</el-button-group>

							<el-button-group style="margin-left: 20px">
								<el-button type="primary" icon="ele-Plus" @click="openAddDjiDeviceCameraEnum" v-auth="'djiDeviceCameraEnum:add'"> 新增 </el-button>
							</el-button-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>
		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" tooltip-effect="light" row-key="id" @sort-change="sortChange" border="">
				<el-table-column type="index" label="序号" width="55" align="center" />
				<el-table-column prop="name" label="产品名称" width="140" show-overflow-tooltip="" />
				<el-table-column prop="productType" label="产品类型" width="140" show-overflow-tooltip="" />
				<el-table-column prop="domain" label="领域" width="140" show-overflow-tooltip="">
					<template #default="scope">
						<el-tag>{{ getEnumDesc(scope.row.domain, getEnumDomainData_Index) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="tsgIndex" label="type-subtype-gimbalindex" width="360" show-overflow-tooltip="" />
				<el-table-column prop="cameraPosition" label="相机位置" width="140" show-overflow-tooltip="">
					<template #default="scope">
						<el-tag>{{ getEnumDesc(scope.row.cameraPosition, getEnumCameraPositionData_Index) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="isMainGimbal" label="主云台" width="120" show-overflow-tooltip="">
					<template #default="scope">
						<el-tag v-if="scope.row.isMainGimbal"> 是 </el-tag>
						<el-tag type="danger" v-else> 否 </el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="desc" label="备注" width="140" show-overflow-tooltip="" />
				<el-table-column label="操作" width="140" align="center" fixed="right" show-overflow-tooltip="" v-if="auth('djiDeviceCameraEnum:edit') || auth('djiDeviceCameraEnum:delete')">
					<template #default="scope">
						<el-button icon="ele-Edit" size="small" text="" type="primary" @click="openEditDjiDeviceCameraEnum(scope.row)" v-auth="'djiDeviceCameraEnum:edit'"> 编辑 </el-button>
						<el-button icon="ele-Delete" size="small" text="" type="primary" @click="delDjiDeviceCameraEnum(scope.row)" v-auth="'djiDeviceCameraEnum:delete'"> 删除 </el-button>
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
			<printDialog ref="printDialogRef" :title="printDjiDeviceCameraEnumTitle" @reloadTable="handleQuery" />
			<editDialog ref="editDialogRef" :title="editDjiDeviceCameraEnumTitle" @reloadTable="handleQuery" />
		</el-card>
	</div>
</template>

<script lang="ts" setup="" name="djiDeviceCameraEnum">
import { ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { auth } from '/@/utils/authFunction';
import { getDictDataItem as di, getDictDataList as dl } from '/@/utils/dict-utils';
import { formatDate } from '/@/utils/formatTime';

import printDialog from '/@/views/system/print/component/hiprint/preview.vue';
import editDialog from '/@/views/main/djiDeviceCameraEnum/component/editDialog.vue';
import { pageDjiDeviceCameraEnum, deleteDjiDeviceCameraEnum } from '/@/api/main/djiDeviceCameraEnum';
import { getAPI } from '/@/utils/axios-utils';
import { SysEnumApi } from '/@/api-services/api';
import commonFunction from '/@/utils/commonFunction';

const getEnumDomainData_Index = ref<any>([]);
const getEnumCameraPositionData_Index = ref<any>([]);
const { getEnumDesc } = commonFunction();
const showAdvanceQueryUI = ref(false);
const printDialogRef = ref();
const editDialogRef = ref();
const loading = ref(false);
const tableData = ref<any>([]);
const queryParams = ref<any>({});
const tableParams = ref({
	page: 1,
	pageSize: 10,
	total: 0,
});

const printDjiDeviceCameraEnumTitle = ref('');
const editDjiDeviceCameraEnumTitle = ref('');

// 改变高级查询的控件显示状态
const changeAdvanceQueryUI = () => {
	showAdvanceQueryUI.value = !showAdvanceQueryUI.value;
};

// 查询操作
const handleQuery = async () => {
	loading.value = true;
	var res = await pageDjiDeviceCameraEnum(Object.assign(queryParams.value, tableParams.value));
	tableData.value = res.data.result?.items ?? [];
	tableParams.value.total = res.data.result?.total;
	loading.value = false;
	getEnumDomainData_Index.value = (await getAPI(SysEnumApi).apiSysEnumEnumDataListGet('DomainEnum')).data.result ?? [];
	getEnumCameraPositionData_Index.value = (await getAPI(SysEnumApi).apiSysEnumEnumDataListGet('CameraPositionEnum')).data.result ?? [];
};

// 列排序
const sortChange = async (column: any) => {
	queryParams.value.field = column.prop;
	queryParams.value.order = column.order;
	await handleQuery();
};

// 打开新增页面
const openAddDjiDeviceCameraEnum = () => {
	editDjiDeviceCameraEnumTitle.value = '添加相机枚举';
	editDialogRef.value.openDialog({});
};

// 打开打印页面
const openPrintDjiDeviceCameraEnum = async (row: any) => {
	printDjiDeviceCameraEnumTitle.value = '打印相机枚举';
};

// 打开编辑页面
const openEditDjiDeviceCameraEnum = (row: any) => {
	editDjiDeviceCameraEnumTitle.value = '编辑相机枚举';
	editDialogRef.value.openDialog(row);
};

// 删除
const delDjiDeviceCameraEnum = (row: any) => {
	ElMessageBox.confirm(`确定要删除吗?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await deleteDjiDeviceCameraEnum(row);
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

handleQuery();
</script>
<style scoped>
:deep(.el-ipnut),
:deep(.el-select),
:deep(.el-input-number) {
	width: 100%;
}
</style>
