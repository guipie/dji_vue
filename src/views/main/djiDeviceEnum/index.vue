<template>
	<div class="djiDeviceEnum-container">
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
					<el-col :xs="24" :sm="20" :md="20" :lg="14" :xl="8" class="mb10">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery" v-auth="'djiDeviceEnum:page'"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="() => (queryParams = {})"> 重置 </el-button>
								<el-button icon="ele-ZoomIn" @click="changeAdvanceQueryUI" v-if="!showAdvanceQueryUI"> 高级 </el-button>
								<el-button icon="ele-ZoomOut" @click="changeAdvanceQueryUI" v-if="showAdvanceQueryUI"> 隐藏 </el-button>
							</el-button-group>

							<el-button-group style="margin-left: 20px">
								<el-button type="primary" icon="ele-Plus" @click="openAddDjiDeviceEnum" v-auth="'djiDeviceEnum:add'"> 新增 </el-button>
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
				<el-table-column prop="domain" label="领域" width="140" show-overflow-tooltip="">
					<template #default="scope">
						<el-tag>{{ getEnumDesc(scope.row.domain, getEnumDomainData_Index) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="type" label="主类型" width="140" show-overflow-tooltip="" />
				<el-table-column prop="subType" label="子类型" width="140" show-overflow-tooltip="" />
				<el-table-column prop="desc" label="备注" show-overflow-tooltip="" />
				<el-table-column label="操作" width="140" align="center" fixed="right" show-overflow-tooltip="" v-if="auth('djiDeviceEnum:edit') || auth('djiDeviceEnum:delete')">
					<template #default="scope">
						<el-button icon="ele-Edit" size="small" text="" type="primary" @click="openEditDjiDeviceEnum(scope.row)" v-auth="'djiDeviceEnum:edit'"> 编辑 </el-button>
						<el-button icon="ele-Delete" size="small" text="" type="primary" @click="delDjiDeviceEnum(scope.row)" v-auth="'djiDeviceEnum:delete'"> 删除 </el-button>
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
			<printDialog ref="printDialogRef" :title="printDjiDeviceEnumTitle" @reloadTable="handleQuery" />
			<editDialog ref="editDialogRef" :title="editDjiDeviceEnumTitle" @reloadTable="handleQuery" />
		</el-card>
	</div>
</template>

<script lang="ts" setup="" name="djiDeviceEnum">
import { ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { auth } from '/@/utils/authFunction';
import { getDictDataItem as di, getDictDataList as dl } from '/@/utils/dict-utils';
import { formatDate } from '/@/utils/formatTime';

import printDialog from '/@/views/system/print/component/hiprint/preview.vue';
import editDialog from '/@/views/main/djiDeviceEnum/component/editDialog.vue';
import { pageDjiDeviceEnum, deleteDjiDeviceEnum } from '/@/api/main/djiDeviceEnum';
import { getAPI } from '/@/utils/axios-utils';
import { SysEnumApi } from '/@/api-services/api';
import commonFunction from '/@/utils/commonFunction';

const getEnumDomainData_Index = ref<any>([]);

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

const printDjiDeviceEnumTitle = ref('');
const editDjiDeviceEnumTitle = ref('');

// 改变高级查询的控件显示状态
const changeAdvanceQueryUI = () => {
	showAdvanceQueryUI.value = !showAdvanceQueryUI.value;
};

// 查询操作
const handleQuery = async () => {
	loading.value = true;
	var res = await pageDjiDeviceEnum(Object.assign(queryParams.value, tableParams.value));
	tableData.value = res.data.result?.items ?? [];
	tableParams.value.total = res.data.result?.total;
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
const openAddDjiDeviceEnum = () => {
	editDjiDeviceEnumTitle.value = '添加设备枚举';
	editDialogRef.value.openDialog({});
};

// 打开打印页面
const openPrintDjiDeviceEnum = async (row: any) => {
	printDjiDeviceEnumTitle.value = '打印设备枚举';
};

// 打开编辑页面
const openEditDjiDeviceEnum = (row: any) => {
	editDjiDeviceEnumTitle.value = '编辑设备枚举';
	editDialogRef.value.openDialog(row);
};

// 删除
const delDjiDeviceEnum = (row: any) => {
	ElMessageBox.confirm(`确定要删除吗?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await deleteDjiDeviceEnum(row);
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
