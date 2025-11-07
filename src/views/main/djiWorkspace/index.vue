<template>
	<div class="djiWorkspace-container">
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" ref="queryForm" labelWidth="90">
				<el-row :gutter="10">
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10">
						<el-form-item label="关键字">
							<el-input v-model="queryParams.searchKey" clearable="" placeholder="请输入模糊查询关键字" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="空间名称">
							<el-input v-model="queryParams.workspaceName" clearable="" placeholder="请输入空间名称" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="空间昵称">
							<el-input v-model="queryParams.nickName" clearable="" placeholder="请输入空间昵称" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10" v-if="showAdvanceQueryUI">
						<el-form-item label="绑定码">
							<el-input v-model="queryParams.workspaceBindCode" clearable="" placeholder="请输入绑定码" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="20" :md="20" :lg="14" :xl="8" class="mb10">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery" v-auth="'djiWorkspace:page'"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="() => (queryParams = {})"> 重置 </el-button>
								<el-button icon="ele-ZoomIn" @click="changeAdvanceQueryUI" v-if="!showAdvanceQueryUI"> 高级 </el-button>
								<el-button icon="ele-ZoomOut" @click="changeAdvanceQueryUI" v-if="showAdvanceQueryUI"> 隐藏 </el-button>
							</el-button-group>

							<el-button-group style="margin-left: 20px">
								<el-button type="primary" icon="ele-Plus" @click="openAddDjiWorkspace" v-auth="'djiWorkspace:add'"> 新增 </el-button>
							</el-button-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>
		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" tooltip-effect="light" row-key="id" @sort-change="sortChange" border="">
				<el-table-column type="index" label="序号" width="55" align="center" />
				<el-table-column prop="workspaceId" label="空间ID" width="300" show-overflow-tooltip="" />
				<el-table-column prop="nickName" label="空间昵称" width="140" show-overflow-tooltip="" />
				<el-table-column prop="workspaceName" label="空间名称" width="140" show-overflow-tooltip="" />
				<el-table-column prop="workspaceBindCode" label="绑定码" width="140" show-overflow-tooltip="" />
				<el-table-column prop="workspaceDesc" label="描述" width="140" show-overflow-tooltip="" />
				<el-table-column label="操作" width="140" align="center" fixed="right" show-overflow-tooltip="" v-if="auth('djiWorkspace:edit') || auth('djiWorkspace:delete')">
					<template #default="scope">
						<el-button icon="ele-Edit" size="small" text="" type="primary" @click="openEditDjiWorkspace(scope.row)" v-auth="'djiWorkspace:edit'"> 编辑 </el-button>
						<el-button icon="ele-Delete" size="small" text="" type="primary" @click="delDjiWorkspace(scope.row)" v-auth="'djiWorkspace:delete'"> 删除 </el-button>
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
			<printDialog ref="printDialogRef" :title="printDjiWorkspaceTitle" @reloadTable="handleQuery" />
			<editDialog ref="editDialogRef" :title="editDjiWorkspaceTitle" @reloadTable="handleQuery" />
		</el-card>
	</div>
</template>

<script lang="ts" setup="" name="djiWorkspace">
import { ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { auth } from '/@/utils/authFunction';
import { getDictDataItem as di, getDictDataList as dl } from '/@/utils/dict-utils';
import { formatDate } from '/@/utils/formatTime';

import printDialog from '/@/views/system/print/component/hiprint/preview.vue';
import editDialog from '/@/views/main/djiWorkspace/component/editDialog.vue';
import { pageDjiWorkspace, deleteDjiWorkspace } from '/@/api/main/djiWorkspace';

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

const printDjiWorkspaceTitle = ref('');
const editDjiWorkspaceTitle = ref('');

// 改变高级查询的控件显示状态
const changeAdvanceQueryUI = () => {
	showAdvanceQueryUI.value = !showAdvanceQueryUI.value;
};

// 查询操作
const handleQuery = async () => {
	loading.value = true;
	var res = await pageDjiWorkspace(Object.assign(queryParams.value, tableParams.value));
	tableData.value = res.data.result?.items ?? [];
	tableParams.value.total = res.data.result?.total;
	loading.value = false;
};

// 列排序
const sortChange = async (column: any) => {
	queryParams.value.field = column.prop;
	queryParams.value.order = column.order;
	await handleQuery();
};

// 打开新增页面
const openAddDjiWorkspace = () => {
	editDjiWorkspaceTitle.value = '添加空间配置';
	editDialogRef.value.openDialog({});
};

// 打开打印页面
const openPrintDjiWorkspace = async (row: any) => {
	printDjiWorkspaceTitle.value = '打印空间配置';
};

// 打开编辑页面
const openEditDjiWorkspace = (row: any) => {
	editDjiWorkspaceTitle.value = '编辑空间配置';
	editDialogRef.value.openDialog(row);
};

// 删除
const delDjiWorkspace = (row: any) => {
	ElMessageBox.confirm(`确定要删除吗?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await deleteDjiWorkspace(row);
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
