<template>
	<div class="djiWorkspaceUser-container">
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" ref="queryForm" labelWidth="90">
				<el-row>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10">
						<el-form-item label="空间">
							<workspaceSelect v-model:id="queryParams.workspaceId"></workspaceSelect>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="4" class="mb10">
						<el-form-item label="关键字">
							<el-input v-model="queryParams.searchKey" clearable="" placeholder="请输入模糊查询关键字用户名昵称" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="20" :md="20" :lg="14" :xl="8" class="mb10">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery" v-auth="'djiWorkspaceUser:page'"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="() => (queryParams = {})"> 重置 </el-button>
								<el-button icon="ele-ZoomIn" @click="changeAdvanceQueryUI" v-if="!showAdvanceQueryUI"> 高级 </el-button>
								<el-button icon="ele-ZoomOut" @click="changeAdvanceQueryUI" v-if="showAdvanceQueryUI"> 隐藏 </el-button>
							</el-button-group>

							<el-button-group style="margin-left: 20px">
								<el-button type="primary" icon="ele-Plus" @click="openAddDjiWorkspaceUser" v-auth="'djiWorkspaceUser:add'"> 新增 </el-button>
							</el-button-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>
		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" tooltip-effect="light" row-key="id" @sort-change="sortChange" border="">
				<el-table-column type="index" label="序号" width="55" align="center" />
				<el-table-column prop="account" label="账号" width="145" show-overflow-tooltip="" />
				<el-table-column prop="nickName" label="昵称" width="145" show-overflow-tooltip="" />
				<el-table-column prop="workspaceNickName" label="默认空间" width="145" show-overflow-tooltip="">
					<template #default="scope">
						<el-tag type="success" effect="dark" v-if="scope.row.workspaceNickName">{{ scope.row.workspaceNickName }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="workspaces" label="所属空间" show-overflow-tooltip="">
					<template #default="scope">
						<div style="display: flex; gap: 5px">
							<el-tag v-for="item in scope.row.workspaces" :key="item.id">{{ item.workspaceNickName }}</el-tag>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="140" align="center" fixed="right" show-overflow-tooltip="" v-if="auth('djiWorkspaceUser:edit') || auth('djiWorkspaceUser:delete')">
					<template #default="scope">
						<el-button icon="ele-Setting" size="small" text="" type="primary" @click="openEditDjiWorkspaceUser(scope.row)" v-auth="'djiWorkspaceUser:edit'"> 配置 </el-button>
						<el-button icon="ele-Delete" size="small" text="" type="primary" @click="delDjiWorkspaceUser(scope.row)" v-auth="'djiWorkspaceUser:delete'"> 清空 </el-button>
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
			<printDialog ref="printDialogRef" :title="printDjiWorkspaceUserTitle" @reloadTable="handleQuery" />
			<editDialog ref="editDialogRef" :title="editDjiWorkspaceUserTitle" @reloadTable="handleQuery" />
		</el-card>
	</div>
</template>

<script lang="ts" setup="" name="djiWorkspaceUser">
import { ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { auth } from '/@/utils/authFunction';
import { getDictDataItem as di, getDictDataList as dl } from '/@/utils/dict-utils';
import { formatDate } from '/@/utils/formatTime';

import printDialog from '/@/views/system/print/component/hiprint/preview.vue';
import editDialog from '/@/views/main/djiWorkspaceUser/component/editDialog.vue';
import { pageDjiWorkspaceUser, deleteDjiWorkspaceUser } from '/@/api/main/djiWorkspaceUser';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import { template } from 'lodash-es';

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

const printDjiWorkspaceUserTitle = ref('');
const editDjiWorkspaceUserTitle = ref('');

// 改变高级查询的控件显示状态
const changeAdvanceQueryUI = () => {
	showAdvanceQueryUI.value = !showAdvanceQueryUI.value;
};

// 查询操作
const handleQuery = async () => {
	loading.value = true;
	var res = await pageDjiWorkspaceUser(Object.assign(queryParams.value, tableParams.value));
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
const openAddDjiWorkspaceUser = () => {
	editDjiWorkspaceUserTitle.value = '添加空间用户';
	editDialogRef.value.openDialog({});
};

// 打开打印页面
const openPrintDjiWorkspaceUser = async (row: any) => {
	printDjiWorkspaceUserTitle.value = '打印空间用户';
};

// 打开编辑页面
const openEditDjiWorkspaceUser = (row: any) => {
	editDjiWorkspaceUserTitle.value = '编辑空间用户';
	editDialogRef.value.openDialog(row);
};

// 删除
const delDjiWorkspaceUser = (row: any) => {
	ElMessageBox.confirm(`确定要清空该用户[${row.nickName}]下的所有空间数据吗?`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			await deleteDjiWorkspaceUser(row);
			handleQuery();
			ElMessage.success('清空成功');
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
