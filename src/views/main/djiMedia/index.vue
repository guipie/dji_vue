<template>
	<div class="djiMedia-container">
		<!-- 总览统计 -->
		<el-row :gutter="8" class="mb10">
			<el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">媒体总数</div>
					<div class="text-2xl font-bold mt-1">{{ stats.totalCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">占用空间</div>
					<div class="text-2xl font-bold mt-1">{{ formatSize(stats.totalSize) }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">图片</div>
					<div class="text-2xl font-bold mt-1">{{ stats.imageCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">视频</div>
					<div class="text-2xl font-bold mt-1">{{ stats.videoCount }}</div>
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
						<el-form-item label="回传机场">
							<el-select v-model="queryParams.dockSn" clearable filterable placeholder="全部机场">
								<el-option v-for="dock in docks" :key="dock.sn" :label="dockLabel(dock)" :value="dock.sn" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="3" class="mb10">
						<el-form-item label="媒体类型">
							<el-select v-model="queryParams.fileType" clearable placeholder="全部类型">
								<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="所属任务">
							<el-select v-model="queryParams.flightId" clearable filterable placeholder="全部任务">
								<el-option v-for="item in taskOptions" :key="item.flightId" :label="item.label" :value="item.flightId" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="文件名">
							<el-input v-model="queryParams.fileName" clearable placeholder="关键字" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="5" class="mb10">
						<el-form-item label="拍摄时间">
							<el-date-picker
								v-model="dateRange"
								type="datetimerange"
								range-separator="至"
								start-placeholder="开始"
								end-placeholder="结束"
								value-format="YYYY-MM-DD HH:mm:ss"
								style="width: 100%"
								@change="handleDateChange"
							/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="5">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="resetQuery"> 重置 </el-button>
							</el-button-group>
							<el-checkbox v-model="queryParams.onlyOriginal" class="ml-4" @change="handleQuery"> 仅看原图 </el-checkbox>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<!-- 媒体列表 -->
		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<div class="mb10">
				<el-button type="danger" icon="ele-Delete" :disabled="selection.length === 0" @click="handleBatchDelete">
					删除记录（{{ selection.length }}）
				</el-button>
				<span class="ml-4 text-xs c-gray">
					删除只移除平台记录，对象存储里的文件不会被删除；如需释放空间请在对象存储侧按前缀清理。
				</span>
			</div>

			<el-table :data="tableData" style="width: 100%" v-loading="loading" tooltip-effect="light" row-key="id" border @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="45" align="center" />
				<el-table-column label="预览" width="88" align="center">
					<template #default="scope">
						<div class="media-thumb" @click="openPreview(scope.row)">
							<img v-if="isImage(scope.row)" :src="scope.row.url" :alt="scope.row.fileName" loading="lazy" />
							<el-icon v-else-if="scope.row.previewable" class="c-primary text-2xl"><ele-VideoPlay /></el-icon>
							<el-icon v-else class="c-gray text-2xl"><ele-Document /></el-icon>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
				<el-table-column prop="fileTypeName" label="类型" width="80" align="center">
					<template #default="scope">
						<el-tag effect="plain" size="small">{{ scope.row.fileTypeName || '未知' }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="sizeText" label="大小" width="95" align="right" />
				<el-table-column prop="dockSn" label="回传机场" width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn || '-' }}</template>
				</el-table-column>
				<el-table-column prop="flightJobName" label="所属任务" min-width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.flightJobName || scope.row.flightId || '-' }}</template>
				</el-table-column>
				<el-table-column prop="mediaCreateTime" label="拍摄时间" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.mediaCreateTime) || formatDateTime(scope.row.createTime) }}</template>
				</el-table-column>
				<el-table-column label="坐标" width="170">
					<template #default="scope">
						<span v-if="scope.row.longitude != null && scope.row.latitude != null" class="font-mono text-xs">
							{{ scope.row.longitude.toFixed(6) }}, {{ scope.row.latitude.toFixed(6) }}
						</span>
						<span v-else class="c-gray">-</span>
					</template>
				</el-table-column>
				<el-table-column label="高度" width="110" align="center">
					<template #default="scope">
						<span v-if="scope.row.relativeAltitude != null">{{ Number(scope.row.relativeAltitude).toFixed(1) }} m</span>
						<span v-else class="c-gray">-</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="220" align="center" fixed="right">
					<template #default="scope">
						<el-button v-if="scope.row.previewable" icon="ele-View" size="small" text type="primary" @click="openPreview(scope.row)">
							预览
						</el-button>
						<el-button icon="ele-Download" size="small" text type="success" @click="handleDownload(scope.row)">下载</el-button>
						<el-button icon="ele-InfoFilled" size="small" text type="info" @click="openDetail(scope.row)">详情</el-button>
						<el-button icon="ele-Delete" size="small" text type="danger" @click="handleDelete(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-pagination
				v-model:currentPage="tableParams.page"
				v-model:page-size="tableParams.pageSize"
				:total="tableParams.total"
				:page-sizes="[12, 24, 48, 96]"
				small
				background
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleQuery"
				@current-change="handleQuery"
			/>
		</el-card>

		<!-- 预览 -->
		<el-dialog v-model="previewVisible" :title="previewRow?.fileName || '预览'" width="900px" top="5vh" destroy-on-close>
			<div v-if="previewRow" class="preview-box">
				<img v-if="isImage(previewRow)" :src="previewRow.url" :alt="previewRow.fileName" />
				<video v-else-if="previewRow.fileType === 2" :src="previewRow.url" controls autoplay playsinline style="width: 100%; max-height: 70vh" />
				<el-empty v-else description="该类型文件不支持在线预览" />
			</div>
			<el-descriptions v-if="previewRow" :column="2" border size="small" class="mt-2">
				<el-descriptions-item label="类型">{{ previewRow.fileTypeName }}</el-descriptions-item>
				<el-descriptions-item label="大小">{{ previewRow.sizeText }}</el-descriptions-item>
				<el-descriptions-item label="拍摄时间">{{ formatDateTime(previewRow.mediaCreateTime) || '-' }}</el-descriptions-item>
				<el-descriptions-item label="拍摄位置">
					<span v-if="previewRow.longitude != null" class="font-mono text-xs">
						{{ previewRow.longitude.toFixed(6) }}, {{ previewRow.latitude.toFixed(6) }}
					</span>
					<span v-else>-</span>
				</el-descriptions-item>
				<el-descriptions-item label="对象存储 Key" :span="2">
					<span class="font-mono text-xs break-all">{{ previewRow.objectKey }}</span>
				</el-descriptions-item>
			</el-descriptions>
			<template #footer>
				<el-button icon="ele-Download" @click="handleDownload(previewRow)">下载原文件</el-button>
				<el-button @click="previewVisible = false">关闭</el-button>
			</template>
		</el-dialog>

		<!-- 详情 -->
		<el-drawer v-model="detailVisible" title="媒体详情" size="50%">
			<el-descriptions v-if="detail" :column="2" border size="small">
				<el-descriptions-item label="文件名" :span="2">{{ detail.fileName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="媒体类型">{{ detail.fileTypeName }}</el-descriptions-item>
				<el-descriptions-item label="是否原图">{{ detail.isOriginal ? '是' : '否' }}</el-descriptions-item>
				<el-descriptions-item label="文件大小">{{ detail.sizeText }}</el-descriptions-item>
				<el-descriptions-item label="后缀">{{ detail.suffix || '-' }}</el-descriptions-item>
				<el-descriptions-item label="拍摄时间">{{ formatDateTime(detail.mediaCreateTime) || '-' }}</el-descriptions-item>
				<el-descriptions-item label="回传时间">{{ formatDateTime(detail.createTime) || '-' }}</el-descriptions-item>
				<el-descriptions-item label="回传机场">{{ detail.dockNick || detail.dockSn || '-' }}</el-descriptions-item>
				<el-descriptions-item label="拍摄飞行器">{{ detail.droneSn || '-' }}</el-descriptions-item>
				<el-descriptions-item label="所属任务" :span="2">
					{{ detail.flightJobName || '-' }}
					<span v-if="detail.flightId" class="font-mono text-xs c-gray ml-2">{{ detail.flightId }}</span>
				</el-descriptions-item>
				<el-descriptions-item label="绝对高度">{{ detail.absoluteAltitude != null ? detail.absoluteAltitude.toFixed(1) + ' m' : '-' }}</el-descriptions-item>
				<el-descriptions-item label="相对高度">{{ detail.relativeAltitude != null ? detail.relativeAltitude.toFixed(1) + ' m' : '-' }}</el-descriptions-item>
				<el-descriptions-item label="云台偏航角">{{ detail.gimbalYawDegree != null ? detail.gimbalYawDegree.toFixed(1) + '°' : '-' }}</el-descriptions-item>
				<el-descriptions-item label="文件组">{{ detail.fileGroupId || '-' }}</el-descriptions-item>
				<el-descriptions-item label="存储桶">{{ detail.bucket || '-' }}</el-descriptions-item>
				<el-descriptions-item label="飞行器型号">{{ detail.droneModelKey || '-' }}</el-descriptions-item>
				<el-descriptions-item label="负载型号">{{ detail.payloadModelKey || '-' }}</el-descriptions-item>
				<el-descriptions-item label="业务路径" :span="2">
					<span class="font-mono text-xs break-all">{{ detail.bizPath || '-' }}</span>
				</el-descriptions-item>
				<el-descriptions-item label="对象存储 Key" :span="2">
					<span class="font-mono text-xs break-all">{{ detail.objectKey }}</span>
				</el-descriptions-item>
				<el-descriptions-item label="访问地址" :span="2">
					<span class="font-mono text-xs break-all">{{ detail.url || '未配置对象存储，无法拼接访问地址' }}</span>
				</el-descriptions-item>
			</el-descriptions>

			<div class="mt-2">
				<el-alert type="info" :closable="false" show-icon>
					<template #title>关于坐标</template>
					经纬度为协议原始值（WGS84）。若叠加到高德 / 百度底图上需自行做一次坐标纠偏，
					平台刻意不做转换以免丢失测绘所需的原始值。
				</el-alert>
			</div>

			<div class="mt-2">
				<el-button v-if="detail?.flightId" type="primary" icon="ele-Top" @click="handlePrioritize">
					把该任务的媒体调为最高上传优先级
				</el-button>
			</div>

			<!-- 同一任务的全部成果：按拍摄时间正序，便于按航点顺序核对 -->
			<template v-if="detail?.flightId">
				<el-divider content-position="left">该任务全部媒体（{{ detailTaskMedia.length }}）</el-divider>
				<el-empty v-if="detailTaskMedia.length === 0" description="暂无其它媒体" :image-size="60" />
				<div v-else class="task-media-strip">
					<div v-for="item in detailTaskMedia" :key="item.id" class="task-media-item" :class="{ active: item.id === detail.id }" @click="openPreview(item)">
						<img v-if="isImage(item)" :src="item.url" :alt="item.fileName" loading="lazy" />
						<el-icon v-else class="c-primary text-xl"><ele-VideoPlay /></el-icon>
						<span class="text-xs break-all">{{ item.fileName }}</span>
					</div>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup lang="ts" name="djiMedia">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import {
	deleteDjiMedia,
	dockOptionsDjiMedia,
	detailDjiMedia,
	mediaByTask,
	pageDjiMedia,
	prioritizeDjiMedia,
	statsDjiMedia,
	taskOptionsDjiMedia,
	typeOptionsDjiMedia,
} from '/@/api/main/djiMedia';

/** 媒体类型枚举：与后端 MediaFileTypeEnum 对应（1 图片 / 2 视频） */
const MediaFileType = { Image: 1, Video: 2 };

const loading = ref(false);
const tableData = ref<any[]>([]);
const selection = ref<any[]>([]);
const queryParams = ref<any>({});
const tableParams = ref({ page: 1, pageSize: 12, total: 0 });
const dateRange = ref<[string, string] | undefined>();

const typeOptions = ref<{ value: number; label: string }[]>([]);
const taskOptions = ref<any[]>([]);
const docks = ref<any[]>([]);

const stats = ref({ totalCount: 0, totalSize: 0, imageCount: 0, videoCount: 0 });

const previewVisible = ref(false);
const previewRow = ref<any>(null);
const detailVisible = ref(false);
const detail = ref<any>(null);
/** 当前详情所属任务的全部媒体（按拍摄时间正序） */
const detailTaskMedia = ref<any[]>([]);

onMounted(async () => {
	await Promise.all([loadTypeOptions(), loadDocks(), loadTaskOptions()]);
	await handleQuery();
});

/* ------------------------------ 字典与下拉 ------------------------------ */

async function loadTypeOptions() {
	try {
		const res = await typeOptionsDjiMedia();
		typeOptions.value = res.data.result ?? [];
	} catch {
		typeOptions.value = [];
	}
}

async function loadDocks(workspaceId?: string) {
	try {
		const res = await dockOptionsDjiMedia(workspaceId || queryParams.value.workspaceId);
		docks.value = res.data.result ?? [];
	} catch {
		docks.value = [];
	}
}

async function loadTaskOptions(workspaceId?: string) {
	try {
		const res = await taskOptionsDjiMedia({ workspaceId: workspaceId || queryParams.value.workspaceId });
		taskOptions.value = res.data.result ?? [];
	} catch {
		taskOptions.value = [];
	}
}

function dockLabel(dock: any) {
	return dock.mediaCount > 0 ? `${dock.label} · ${dock.mediaCount} 个文件` : dock.label;
}

/* ------------------------------ 查询 ------------------------------ */

function handleDateChange(value: [string, string] | undefined) {
	queryParams.value.startTime = value?.[0];
	queryParams.value.endTime = value?.[1];
	handleQuery();
}

async function handleQuery() {
	loading.value = true;
	try {
		const res = await pageDjiMedia(Object.assign({}, queryParams.value, tableParams.value));
		tableData.value = res.data.result?.items ?? [];
		tableParams.value.total = res.data.result?.total ?? 0;
		await loadStats();
	} finally {
		loading.value = false;
	}
}

async function loadStats() {
	try {
		const res = await statsDjiMedia({
			workspaceId: queryParams.value.workspaceId,
			dockSn: queryParams.value.dockSn,
		});
		stats.value = res.data.result ?? stats.value;
	} catch {
		// 统计失败不阻塞列表
	}
}

function resetQuery() {
	queryParams.value = {};
	dateRange.value = undefined;
	tableParams.value.page = 1;
	loadDocks();
	loadTaskOptions();
	handleQuery();
}

/** 切换空间：机场与任务下拉需跟着收敛，避免跨空间选错 */
function handleWorkspaceChange() {
	queryParams.value.dockSn = undefined;
	queryParams.value.flightId = undefined;
	loadDocks(queryParams.value.workspaceId);
	loadTaskOptions(queryParams.value.workspaceId);
	tableParams.value.page = 1;
	handleQuery();
}

/* ------------------------------ 展示辅助 ------------------------------ */

function isImage(row: any) {
	return row?.fileType === MediaFileType.Image;
}

function formatDateTime(value?: string) {
	if (!value) return '';
	return formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS');
}

/** 与后端 DjiMediaService.FormatSize 保持同一套进制，避免前后端显示不一致 */
function formatSize(bytes?: number) {
	const size = Number(bytes ?? 0);
	if (!size) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let index = 0;
	let value = size;
	while (value >= 1024 && index < units.length - 1) {
		value /= 1024;
		index++;
	}
	return `${index === 0 ? value : value.toFixed(2)} ${units[index]}`;
}

/* ------------------------------ 预览与下载 ------------------------------ */

function openPreview(row: any) {
	if (!row?.previewable) return;
	if (!row.url) {
		ElMessage.warning('该文件没有可用访问地址，请检查对象存储配置（Upload.json 的 OSSProvider 段）');
		return;
	}
	previewRow.value = row;
	previewVisible.value = true;
}

/** 走浏览器原生下载，避免经服务端中转（文件在对象存储，服务端不持有字节流） */
function handleDownload(row: any) {
	if (!row?.url) {
		ElMessage.warning('该文件没有可用访问地址，请检查对象存储配置');
		return;
	}
	const link = document.createElement('a');
	link.href = row.url;
	link.download = row.fileName || 'download';
	link.target = '_blank';
	link.rel = 'noopener';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/* ------------------------------ 详情 ------------------------------ */

async function openDetail(row: any) {
	try {
		const res = await detailDjiMedia(row.id);
		detail.value = res.data.result ?? null;
		detailTaskMedia.value = [];
		detailVisible.value = true;

		// 同任务的其它媒体顺手拉一遍，便于按航点顺序核对成果
		if (detail.value?.flightId) {
			detailTaskMedia.value = await loadTaskMedia(detail.value.flightId);
		}
	} catch {
		ElMessage.error('获取媒体详情失败');
	}
}

/* ------------------------------ 删除 ------------------------------ */

function handleSelectionChange(rows: any[]) {
	selection.value = rows ?? [];
}

async function handleDelete(row: any) {
	await ElMessageBox.confirm(
		`确定要删除「${row.fileName || row.objectKey}」的平台记录吗？对象存储里的文件不会被删除。`,
		'删除确认',
		{ type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
	);
	await doDelete([row.id]);
}

async function handleBatchDelete() {
	if (selection.value.length === 0) return;
	await ElMessageBox.confirm(
		`确定要删除选中的 ${selection.value.length} 条平台记录吗？对象存储里的文件不会被删除。`,
		'批量删除确认',
		{ type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
	);
	await doDelete(selection.value.map((m) => m.id));
}

async function doDelete(ids: (number | string)[]) {
	try {
		await deleteDjiMedia(ids);
		ElMessage.success('删除成功');
		selection.value = [];
		await handleQuery();
	} catch {
		// 请求拦截器已提示错误
	}
}

/* ------------------------------ 上传优先级 ------------------------------ */

async function handlePrioritize() {
	const flightId = detail.value?.flightId;
	if (!flightId) return;
	await ElMessageBox.confirm(
		'将请求机场把该任务的媒体提到上传队列最前。机场仅在联网且任务媒体尚未传完时生效，确定继续？',
		'调整上传优先级',
		{ type: 'info', confirmButtonText: '确定', cancelButtonText: '取消' }
	);
	try {
		await prioritizeDjiMedia(flightId);
		ElMessage.success('已请求机场提升该任务媒体的上传优先级');
	} catch {
		// 请求拦截器已提示错误
	}
}

/** 取某任务的全部媒体（按拍摄时间正序），用于详情抽屉里的成果条 */
async function loadTaskMedia(flightId: string) {
	try {
		const res = await mediaByTask({ flightId });
		return res.data.result ?? [];
	} catch {
		return [];
	}
}
</script>

<style scoped lang="scss">
.media-thumb {
	width: 64px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	overflow: hidden;
	background: var(--el-fill-color-light);
	cursor: pointer;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.preview-box {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200px;

	img {
		max-width: 100%;
		max-height: 70vh;
	}
}

.task-media-strip {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
	gap: 8px;
	max-height: 320px;
	overflow-y: auto;
}

.task-media-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 6px;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 4px;
	cursor: pointer;
	text-align: center;

	&:hover {
		border-color: var(--el-color-primary-light-5);
	}

	&.active {
		border-color: var(--el-color-primary);
		background: var(--el-color-primary-light-9);
	}

	img {
		width: 100%;
		height: 64px;
		object-fit: cover;
		border-radius: 2px;
	}

	.el-icon {
		height: 64px;
	}
}
</style>
