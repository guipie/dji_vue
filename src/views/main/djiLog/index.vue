<template>
	<div class="djiLog-container">
		<!-- 统计 -->
		<el-row :gutter="8" class="mb10">
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">日志总数</div>
					<div class="text-2xl font-bold mt-1">{{ stats.total }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">待上传</div>
					<div class="text-2xl font-bold mt-1">{{ stats.pendingCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">上传中</div>
					<div class="text-2xl font-bold mt-1" :class="{ 'c-primary': stats.uploadingCount > 0 }">{{ stats.uploadingCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">已上传</div>
					<div class="text-2xl font-bold mt-1 c-success">{{ stats.uploadedCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">失败 / 取消</div>
					<div class="text-2xl font-bold mt-1" :class="{ 'c-danger': stats.failedCount > 0 }">{{ stats.failedCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">已上传体积</div>
					<div class="text-2xl font-bold mt-1" style="font-size: 18px">
						{{ formatSize(stats.uploadedSize) }}
						<sapn class="text-xs c-gray">共 {{ formatSize(stats.totalSize) }}</sapn>
					</div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 查询条件 -->
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" label-width="80">
				<el-row>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="空间">
							<workspaceSelect v-model:id="queryParams.workspaceId" @update:id="handleWorkspaceChange"></workspaceSelect>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="机场">
							<el-select v-model="queryParams.dockSn" clearable filterable placeholder="全部机场" @change="handleQuery">
								<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="模块">
							<el-select v-model="queryParams.module" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="上传状态">
							<el-select v-model="queryParams.status" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="文件名">
							<el-input v-model="queryParams.keyword" clearable placeholder="模糊匹配" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="8" class="mb10">
						<el-form-item label="日志时间">
							<el-date-picker
								v-model="dateRange"
								type="daterange"
								range-separator="至"
								start-placeholder="开始日期"
								end-placeholder="结束日期"
								value-format="YYYY-MM-DD HH:mm:ss"
								:default-time="defaultTime"
								@change="handleQuery"
							/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="4">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="resetQuery"> 重置 </el-button>
							</el-button-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<div class="mb10 flex flex-wrap items-center">
				<!-- 操作依赖具体机场（要向设备下发指令），因此这里单独选一次，不受列表筛选影响 -->
				<span class="text-xs c-gray mr-1">操作机场</span>
				<el-select v-model="opDockSn" filterable clearable placeholder="选择要操作的机场" style="width: 260px">
					<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
				</el-select>

				<el-button class="ml-2" icon="ele-Refresh" :loading="listing" @click="handleList"> 列举日志 </el-button>
				<el-button type="primary" icon="ele-Upload" :disabled="selection.length === 0" :loading="starting" @click="handleStart"> 上传（{{ selection.length }}） </el-button>
				<el-button type="warning" icon="ele-Close" @click="handleCancel"> 取消上传 </el-button>
				<el-button type="danger" icon="ele-Delete" :disabled="selection.length === 0" @click="handleBatchDelete"> 删除记录（{{ selection.length }}） </el-button>
			</div>

			<el-alert type="info" :closable="false" show-icon class="mb10">
				<template #title>
					<span class="text-xs">
						分两步：<b>先列举</b>让设备把可上传的日志索引报上来（<span class="font-mono">fileupload_progress</span> 里没有 boot_index，
						必须靠这一步才能把进度对回具体文件），<b>再上传</b>；设备会直传对象存储。 受协议所限，<b>一次只能上传一个模块</b>，且<b>取消是按模块的</b>、无法针对单个文件。
					</span>
				</template>
			</el-alert>

			<el-table :data="tableData" style="width: 100%" v-loading="loading" size="small" border row-key="id" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="45" align="center" />
				<el-table-column prop="moduleName" label="模块" width="90" align="center">
					<template #default="scope">
						<el-tag size="small" effect="plain" :type="scope.row.module === 3 ? 'info' : 'primary'">{{ scope.row.moduleName }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="设备" min-width="170" show-overflow-tooltip>
					<template #default="scope">
						<div>{{ scope.row.deviceName || scope.row.deviceSn || '-' }}</div>
						<div class="font-mono text-xs c-gray">{{ scope.row.deviceSn }}</div>
					</template>
				</el-table-column>
				<el-table-column label="机场" width="140" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn || '-' }}</template>
				</el-table-column>
				<el-table-column prop="bootIndex" label="索引" width="70" align="center" />
				<el-table-column label="日志时段" min-width="200">
					<template #default="scope">
						<div class="text-xs">{{ formatDateTime(scope.row.beginTime) }}</div>
						<div class="text-xs c-gray">{{ formatDateTime(scope.row.endTime) }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="fileSizeText" label="大小" width="100" align="right" />
				<el-table-column label="上传状态" width="110" align="center">
					<template #default="scope">
						<el-tag size="small" effect="plain" :type="statusTagType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="进度" min-width="150">
					<template #default="scope">
						<el-progress v-if="scope.row.isRunning" :percentage="scope.row.progress ?? 0" :stroke-width="10" />
						<template v-else>
							<div class="text-xs c-gray">{{ scope.row.fileName || '-' }}</div>
						</template>
						<div v-if="scope.row.uploadRate" class="text-xs c-gray">{{ formatSpeed(scope.row.uploadRate) }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="errorMessage" label="错误" min-width="140" show-overflow-tooltip>
					<template #default="scope">
						<span class="c-danger">{{ scope.row.errorMessage }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="operatorName" label="发起人" width="100" />
				<el-table-column prop="finishTime" label="完成时间" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.finishTime) }}</template>
				</el-table-column>
				<el-table-column label="操作" width="90" align="center" fixed="right">
					<template #default="scope">
						<el-button v-if="scope.row.status === 2 && scope.row.url" icon="ele-Download" size="small" text type="primary" @click="download(scope.row)"> 下载 </el-button>
						<span v-else class="text-xs c-gray">-</span>
					</template>
				</el-table-column>
			</el-table>

			<el-pagination
				v-model:currentPage="tableParams.page"
				v-model:page-size="tableParams.pageSize"
				:total="tableParams.total"
				:page-sizes="[20, 50, 100]"
				small
				background
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleQuery"
				@current-change="handleQuery"
			/>
		</el-card>

		<!-- 列举范围 -->
		<el-dialog v-model="listVisible" title="列举设备日志" width="420px">
			<el-form label-width="90">
				<el-form-item label="目标机场">
					<el-select v-model="opDockSn" filterable placeholder="请选择机场" style="width: 100%">
						<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
					</el-select>
				</el-form-item>
				<el-form-item label="模块范围">
					<el-checkbox-group v-model="listModules">
						<el-checkbox v-for="item in moduleOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
			</el-form>
			<div class="text-xs c-gray">设备只会返回被问到的模块，全部留空表示两个模块都问。</div>

			<template #footer>
				<el-button @click="listVisible = false">取消</el-button>
				<el-button type="primary" :loading="listing" @click="submitList">开始列举</el-button>
			</template>
		</el-dialog>

		<!-- 取消上传 -->
		<el-dialog v-model="cancelVisible" title="取消日志上传" width="420px">
			<el-alert type="warning" :closable="false" show-icon class="mb10">
				<template #title>
					<span class="text-xs">协议只支持<b>按模块</b>取消，无法精确到单个文件，被选中模块下所有上传中的任务都会被取消。</span>
				</template>
			</el-alert>

			<el-form label-width="90">
				<el-form-item label="目标机场">
					<el-select v-model="opDockSn" filterable placeholder="请选择机场" style="width: 100%">
						<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
					</el-select>
				</el-form-item>
				<el-form-item label="取消模块">
					<el-checkbox-group v-model="cancelModules">
						<el-checkbox v-for="item in moduleOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="cancelVisible = false">取消</el-button>
				<el-button type="danger" :loading="canceling" @click="submitCancel">确认取消</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="djiLog">
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import { cancelDjiLog, deleteDjiLog, listDjiLog, moduleOptionsDjiLog, pageDjiLog, startDjiLog, statsDjiLog, statusOptionsDjiLog } from '/@/api/main/djiLog';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
// 本模块没有自己的机场下拉：复用控制面板那份，它额外带在线状态与是否在途指令
import { dockOptionsDjiDock } from '/@/api/main/djiDock';

/** 与后端 LogUploadStatusEnum 对应（0 待上传 / 1 上传中 / 2 已上传 / 3 失败 / 4 取消） */
const LogStatus = { Pending: 0, Uploading: 1, Uploaded: 2, Failed: 3, Canceled: 4 };

const loading = ref(false);
const listing = ref(false);
const starting = ref(false);
const canceling = ref(false);

const tableData = ref<any[]>([]);
const selection = ref<any[]>([]);
const queryParams = ref<any>({});
const tableParams = ref({ page: 1, pageSize: 20, total: 0 });
const dateRange = ref<any>(null);
const defaultTime = ref<[Date, Date]>([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]);

const docks = ref<any[]>([]);
const moduleOptions = ref<{ value: number; label: string }[]>([]);
const statusOptions = ref<{ value: number; label: string }[]>([]);
const opDockSn = ref<string>('');

const stats = ref<any>({ total: 0, pendingCount: 0, uploadingCount: 0, uploadedCount: 0, failedCount: 0, totalSize: 0, uploadedSize: 0 });

const listVisible = ref(false);
const cancelVisible = ref(false);
const listModules = ref<number[]>([]);
const cancelModules = ref<number[]>([]);

onMounted(async () => {
	await Promise.all([loadDocks(), loadModuleOptions(), loadStatusOptions()]);
	await handleQuery();
});

/* ------------------------------ 字典与下拉 ------------------------------ */

async function loadDocks() {
	try {
		const res = await dockOptionsDjiDock();
		docks.value = res.data.result ?? [];
	} catch {
		docks.value = [];
	}
}

async function loadModuleOptions() {
	try {
		const res = await moduleOptionsDjiLog();
		moduleOptions.value = res.data.result ?? [];
	} catch {
		moduleOptions.value = [];
	}
}

async function loadStatusOptions() {
	try {
		const res = await statusOptionsDjiLog();
		statusOptions.value = res.data.result ?? [];
	} catch {
		statusOptions.value = [];
	}
}

/* ------------------------------ 查询 ------------------------------ */

async function handleQuery() {
	loading.value = true;
	try {
		const res = await pageDjiLog(
			Object.assign({}, queryParams.value, tableParams.value, {
				startTime: dateRange.value?.[0],
				endTime: dateRange.value?.[1],
			})
		);
		tableData.value = res.data.result?.items ?? [];
		tableParams.value.total = res.data.result?.total ?? 0;
		await loadStats();
	} finally {
		loading.value = false;
	}
}

/** 统计只按空间 + 机场收窄，保持卡片是「整体情况」的参照 */
async function loadStats() {
	try {
		const res = await statsDjiLog({ workspaceId: queryParams.value.workspaceId, dockSn: queryParams.value.dockSn });
		stats.value = res.data.result ?? stats.value;
	} catch {
		// 统计失败不阻塞列表
	}
}

function resetQuery() {
	queryParams.value = {};
	dateRange.value = null;
	tableParams.value.page = 1;
	handleQuery();
}

function handleWorkspaceChange() {
	queryParams.value.dockSn = undefined;
	tableParams.value.page = 1;
	handleQuery();
}

function handleSelectionChange(rows: any[]) {
	selection.value = rows ?? [];
}

/* ------------------------------ 列举 ------------------------------ */

function handleList() {
	if (!opDockSn.value) {
		ElMessage.warning('请先选择要操作的机场');
		return;
	}
	listVisible.value = true;
}

async function submitList() {
	if (!opDockSn.value) return ElMessage.warning('请先选择要操作的机场');

	listing.value = true;
	try {
		const res = await listDjiLog({ dockSn: opDockSn.value, modules: listModules.value });
		const list = res.data.result ?? [];
		ElMessage.success(`列举完成，该机场当前共 ${list.length} 个日志索引`);
		listVisible.value = false;
		// 列举结果就是该机场的最新清单，直接刷新列表即可看到新增项
		queryParams.value.dockSn = opDockSn.value;
		tableParams.value.page = 1;
		await handleQuery();
	} finally {
		listing.value = false;
	}
}

/* ------------------------------ 上传 ------------------------------ */

/**
 * 发起上传。
 *
 * 后端已经拒了跨模块混选（协议只支持按模块取消，多模块并发就无法分别收口），
 * 这里在前端再拦一次，把「报错」提前变成「不可操作」—— 用户体验差别很大。
 */
async function handleStart() {
	if (selection.value.length === 0) return;

	const modules = [...new Set(selection.value.map((m) => m.module))];
	if (modules.length > 1) {
		ElMessage.warning(`一次只能上传一个模块的日志，当前勾选混了 ${modules.length} 个模块`);
		return;
	}

	const dockSn = selection.value[0].dockSn;
	if (selection.value.some((m) => m.dockSn !== dockSn)) {
		ElMessage.warning('一次只能对同一台机场下发上传任务');
		return;
	}

	const uploading = selection.value.filter((m) => m.status === LogStatus.Uploading);
	if (uploading.length > 0) {
		ElMessage.warning(`有 ${uploading.length} 条正在上传中，无需重复发起`);
		return;
	}

	starting.value = true;
	try {
		const res = await startDjiLog({ dockSn, ids: selection.value.map((m) => m.id) });
		ElMessage.success(`已发起上传，共 ${res.data.result ?? 0} 个文件`);
		selection.value = [];
		await handleQuery();
	} finally {
		starting.value = false;
	}
}

/* ------------------------------ 取消 ------------------------------ */

function handleCancel() {
	if (!opDockSn.value) {
		ElMessage.warning('请先选择要操作的机场');
		return;
	}
	cancelVisible.value = true;
}

async function submitCancel() {
	if (cancelModules.value.length === 0) return ElMessage.warning('请至少选择一个模块');

	canceling.value = true;
	try {
		const res = await cancelDjiLog({ dockSn: opDockSn.value, modules: cancelModules.value });
		ElMessage.success(`已取消 ${res.data.result ?? 0} 个文件的上传`);
		cancelVisible.value = false;
		await handleQuery();
	} finally {
		canceling.value = false;
	}
}

/* ------------------------------ 删除 ------------------------------ */

async function handleBatchDelete() {
	if (selection.value.length === 0) return;
	await ElMessageBox.confirm(`确定要删除选中的 ${selection.value.length} 条日志记录吗？只删记录、不删对象存储里的文件。`, '删除确认', {
		type: 'warning',
		confirmButtonText: '确定删除',
		cancelButtonText: '取消',
	});
	try {
		await deleteDjiLog(selection.value.map((m) => m.id));
		ElMessage.success('删除成功');
		selection.value = [];
		await handleQuery();
	} catch {
		// 请求拦截器已提示错误
	}
}

function download(row: any) {
	if (row?.url) window.open(row.url, '_blank');
}

/* ------------------------------ 展示辅助 ------------------------------ */

function formatDateTime(value?: string) {
	if (!value) return '';
	return formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS');
}

function formatSize(bytes?: number) {
	if (bytes == null) return '-';
	const units = ['B', 'KB', 'MB', 'GB'];
	let size = bytes;
	let unit = 0;
	while (size >= 1024 && unit < units.length - 1) {
		size /= 1024;
		unit += 1;
	}
	return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatSpeed(bytesPerSecond?: number) {
	if (!bytesPerSecond) return '';
	return `${formatSize(bytesPerSecond)}/s`;
}

function statusTagType(status: number) {
	if (status === LogStatus.Uploaded) return 'success';
	if (status === LogStatus.Uploading) return 'primary';
	if (status === LogStatus.Failed) return 'danger';
	if (status === LogStatus.Canceled) return 'info';
	return 'warning';
}
</script>
