<template>
	<div class="djiWayline-container">
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" ref="queryForm" labelWidth="80">
				<el-row>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="空间">
							<workspaceSelect v-model:id="queryParams.workspaceId"></workspaceSelect>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="航线类型">
							<el-select v-model="queryParams.waylineType" clearable placeholder="全部类型">
								<el-option v-for="item in waylineTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="关键字">
							<el-input v-model="queryParams.searchKey" clearable placeholder="请输入航线名称" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="6" :xl="8" class="mb10">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="resetQuery"> 重置 </el-button>
							</el-button-group>
							<el-button-group style="margin-left: 20px">
								<el-button type="primary" icon="ele-Plus" @click="openCreate"> 新建航线 </el-button>
							</el-button-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" tooltip-effect="light" row-key="id" border>
				<el-table-column type="index" label="序号" width="55" align="center" />
				<el-table-column prop="waylineName" label="航线名称" min-width="180" show-overflow-tooltip />
				<el-table-column prop="templateStr" label="航线类型" width="110" align="center">
					<template #default="scope">
						<el-tag effect="plain">{{ scope.row.templateStr || '-' }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="drone" label="飞行器" width="140" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.drone || scope.row.droneModel || '-' }}</template>
				</el-table-column>
				<el-table-column prop="workspaceNickName" label="所属空间" width="130" show-overflow-tooltip>
					<template #default="scope">
						<el-tag type="success" effect="dark" v-if="scope.row.workspaceNickName">{{ scope.row.workspaceNickName }}</el-tag>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column prop="pointCount" label="航点数" width="80" align="center" />
				<el-table-column prop="distance" label="航程" width="110" align="right">
					<template #default="scope">{{ formatDistance(scope.row.distance) }}</template>
				</el-table-column>
				<el-table-column prop="duration" label="预计时长" width="110" align="right">
					<template #default="scope">{{ formatDuration(scope.row.duration) }}</template>
				</el-table-column>
				<el-table-column prop="createUserName" label="创建人" width="110" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.createUserName || '-' }}</template>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" width="165" show-overflow-tooltip>
					<template #default="scope">{{ formatDateTime(scope.row.createTime) }}</template>
				</el-table-column>
				<el-table-column label="操作" width="400" align="center" fixed="right">
					<template #default="scope">
						<el-button icon="ele-Promotion" size="small" text type="success" @click="openDispatch(scope.row)">下发任务</el-button>
						<el-button icon="ele-Edit" size="small" text type="primary" @click="openEdit(scope.row)">编辑</el-button>
						<el-button icon="ele-EditPen" size="small" text type="primary" @click="openRename(scope.row)">改名</el-button>
						<el-button icon="ele-CopyDocument" size="small" text type="primary" @click="handleCopy(scope.row)">复制</el-button>
						<el-button icon="ele-Download" size="small" text type="primary" :loading="exportingId === scope.row.id" @click="handleExport(scope.row)">导出KMZ</el-button>
						<el-button icon="ele-Delete" size="small" text type="danger" @click="handleDelete(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-pagination
				v-model:currentPage="tableParams.page"
				v-model:page-size="tableParams.pageSize"
				:total="tableParams.total"
				:page-sizes="[10, 20, 50, 100, 200]"
				small
				background
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleQuery"
				@current-change="handleQuery"
			/>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="djiWayline">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import { downloadByData } from '/@/utils/download';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { copyDjiWayline, deleteDjiWayline, exportDjiWayline, pageDjiWayline, renameDjiWayline } from '/@/api/main/djiWayline';
import type { WaylineListItem } from '/@/types/wayline/waylineCreate';

const router = useRouter();
const waylineStore = useWaylineStore();

const loading = ref(false);
const exportingId = ref<number | null>(null);
const tableData = ref<WaylineListItem[]>([]);
const queryParams = ref<any>({});
const tableParams = ref({ page: 1, pageSize: 10, total: 0 });

/** 与后端 WaylineType 枚举顺序保持一致（0 起） */
const waylineTypeOptions = [
	{ label: '航点飞行', value: 0 },
	{ label: '建图航拍', value: 1 },
	{ label: '倾斜摄影', value: 2 },
	{ label: '航带飞行', value: 3 },
];

onMounted(() => {
	handleQuery();
});

/** 查询 */
async function handleQuery() {
	loading.value = true;
	try {
		const res = await pageDjiWayline(Object.assign(queryParams.value, tableParams.value));
		tableData.value = res.data.result?.items ?? [];
		tableParams.value.total = res.data.result?.total ?? 0;
	} finally {
		loading.value = false;
	}
}

/** 重置查询条件 */
function resetQuery() {
	queryParams.value = {};
	tableParams.value.page = 1;
	handleQuery();
}

/** 新建：重置编辑器状态后进入航线规划页 */
function openCreate() {
	waylineStore.resetWayline();
	router.push({ path: '/wayline/create' });
}

/** 编辑：进入航线规划页，由该页按 id 拉取详情回填 */
function openEdit(row: WaylineListItem) {
	router.push({ path: '/wayline/create', query: { id: row.id } });
}

/** 下发任务：跳转任务中心并预选该航线，由任务中心自动弹出下发对话框 */
function openDispatch(row: WaylineListItem) {
	router.push({ path: '/wayline/task', query: { waylineEntityId: row.id } });
}

/** 重命名 */
async function openRename(row: WaylineListItem) {
	try {
		const { value } = await ElMessageBox.prompt('请输入新的航线名称', '航线重命名', {
			inputValue: row.waylineName,
			inputPattern: /\S+/,
			inputErrorMessage: '航线名称不能为空',
			confirmButtonText: '确定',
			cancelButtonText: '取消',
		});
		await renameDjiWayline({ id: row.id, newName: value.trim() });
		ElMessage.success('重命名成功');
		handleQuery();
	} catch {
		// 用户取消
	}
}

/** 复制：可指定新名称，留空则由后端自动生成「原名-副本」 */
async function handleCopy(row: WaylineListItem) {
	try {
		const { value } = await ElMessageBox.prompt('请输入副本名称，留空将自动命名为「原名-副本」', '复制航线', {
			inputValue: '',
			confirmButtonText: '确定',
			cancelButtonText: '取消',
		});
		await copyDjiWayline({ id: row.id, newName: value?.trim() || undefined });
		ElMessage.success('复制成功');
		handleQuery();
	} catch {
		// 用户取消
	}
}

/** 导出：后端按当前参数实时重新生成 KMZ */
async function handleExport(row: WaylineListItem) {
	exportingId.value = row.id;
	try {
		const res = await exportDjiWayline(row.id);
		downloadByData(res.data as Blob, `${row.waylineName}.kmz`, 'application/vnd.google-earth.kmz');
	} finally {
		exportingId.value = null;
	}
}

/** 删除（软删除） */
async function handleDelete(row: WaylineListItem) {
	try {
		await ElMessageBox.confirm(`确定要删除航线「${row.waylineName}」吗？`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		});
	} catch {
		return;
	}
	await deleteDjiWayline({ id: row.id });
	ElMessage.success('删除成功');
	if (tableData.value.length === 1 && tableParams.value.page > 1) tableParams.value.page -= 1;
	handleQuery();
}

/** 距离格式化：米 → 米/公里 */
function formatDistance(distance?: number) {
	if (!distance) return '0 m';
	return distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance.toFixed(2)} m`;
}

/** 时长格式化：秒 → mm:ss */
function formatDuration(duration?: number) {
	if (!duration) return '00:00';
	const total = Math.round(duration);
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** 创建时间格式化 */
function formatDateTime(value?: string) {
	return value ? formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS') : '-';
}
</script>
