<template>
	<div class="djiFlightArea-container">
		<!-- 查询条件 -->
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" label-width="90">
				<el-row>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="5" class="mb10">
						<el-form-item label="空间">
							<workspaceSelect v-model:id="queryParams.workspaceId" @update:id="handleWorkspaceChange"></workspaceSelect>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="5" class="mb10">
						<el-form-item label="机场">
							<el-select v-model="queryParams.dockSn" clearable filterable placeholder="全部机场" @change="handleQuery">
								<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="同步状态">
							<el-select v-model="queryParams.syncStatus" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in syncStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="文件名">
							<el-input v-model="queryParams.keyword" clearable placeholder="模糊匹配" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="resetQuery"> 重置 </el-button>
							</el-button-group>
							<el-checkbox v-model="onlyActive" class="ml-4" @change="handleOnlyActiveChange"> 只看启用中 </el-checkbox>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<div class="mb10 flex flex-wrap items-center">
				<el-button type="primary" icon="ele-Plus" @click="openRegister"> 登记飞行区文件 </el-button>
				<el-button icon="ele-Refresh" :disabled="selection.length !== 1" @click="handleNotify"> 通知设备同步 </el-button>
				<el-button type="danger" icon="ele-Delete" :disabled="selection.length === 0" @click="handleBatchDelete">
					删除记录（{{ selection.length }}）
				</el-button>
				<span class="ml-4 text-xs c-gray">
					距离快照 ·
					<el-select v-model="locationDockSn" filterable clearable placeholder="选择机场" style="width: 240px" size="small">
						<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
					</el-select>
					<el-button class="ml-1" size="small" @click="openLocations">查看</el-button>
				</span>
			</div>

			<el-alert type="info" :closable="false" show-icon class="mb10">
				<template #title>
					<span class="text-xs">
						这条链路是<b>设备驱动</b>的：云端登记 → 下发同步通知 → 设备自己在方便时来要文件地址（云端此刻才现签 URL）→
						下载启用 → 持续上报进度。因此<b>「已下发通知」不等于「已生效」</b>，真值只能看列表里的同步状态。
					</span>
				</template>
			</el-alert>

			<el-table :data="tableData" style="width: 100%" v-loading="loading" size="small" border row-key="id" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="45" align="center" />
				<el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
				<el-table-column label="机场" width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn || '-' }}</template>
				</el-table-column>
				<el-table-column label="启用中" width="90" align="center">
					<template #default="scope">
						<el-tag v-if="scope.row.isActive" type="success" size="small" effect="dark">启用</el-tag>
						<el-tag v-else type="info" size="small" effect="plain">历史版本</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="同步状态" width="110" align="center">
					<template #default="scope">
						<el-tag size="small" effect="plain" :type="syncTagType(scope.row.syncStatus)">{{ scope.row.syncStatusName }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="syncReasonName" label="失败原因" min-width="180" show-overflow-tooltip>
					<template #default="scope">
						<span class="c-danger">{{ scope.row.syncReasonName }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="fileSizeText" label="大小" width="100" align="right" />
				<el-table-column label="SHA256" width="140">
					<template #default="scope">
						<el-tooltip :content="scope.row.checksum || ''" placement="top">
							<span class="font-mono text-xs">{{ shortDigest(scope.row.checksum) }}</span>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="对象存储 Key" min-width="200" show-overflow-tooltip>
					<template #default="scope"><span class="font-mono text-xs">{{ scope.row.objectKey }}</span></template>
				</el-table-column>
				<el-table-column prop="lastTime" label="最近同步" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.lastTime) }}</template>
				</el-table-column>
				<el-table-column prop="createTime" label="登记时间" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.createTime) }}</template>
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

		<!-- 登记 -->
		<el-dialog v-model="registerVisible" title="登记飞行区文件" width="620px" @closed="resetRegister">
			<el-alert type="info" :closable="false" show-icon class="mb10">
				<template #title>
					<span class="text-xs">
						文件本体请先走平台上传接口存到对象存储，这里只做「登记」。
						<b>SHA256 摘要由服务端从桶里的真实内容算出</b>，不接受人工填写作为首选 ——
						摘要一旦填错会导致设备永远同步不上、且两侧都不报错。
					</span>
				</template>
			</el-alert>

			<el-form :model="registerForm" label-width="120">
				<el-form-item label="目标机场">
					<el-select v-model="registerForm.dockSn" filterable placeholder="请选择机场" style="width: 100%">
						<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
					</el-select>
				</el-form-item>
				<el-form-item label="文件名">
					<el-input v-model="registerForm.fileName" placeholder="如 geofence_park.json" />
					<div class="text-xs c-gray">需与实际对象文件名一致，否则服务端会给出告警</div>
				</el-form-item>
				<el-form-item label="对象地址">
					<el-input v-model="registerForm.objectKey" placeholder="对象存储 Key，或上传后拿到的完整 URL" />
					<div class="text-xs c-gray">两种形式都能识别；粘贴完整 URL 时会自动剥离预签名参数</div>
				</el-form-item>
				<el-form-item label="兜底摘要">
					<el-input v-model="registerForm.checksum" placeholder="留空即可，仅在对象存储读不到内容时生效" />
				</el-form-item>
				<el-form-item label="登记后">
					<el-checkbox v-model="registerForm.syncImmediately">立即下发同步通知</el-checkbox>
				</el-form-item>
				<el-form-item v-if="registerForm.syncImmediately" label="确认下发">
					<el-checkbox v-model="registerForm.confirm">我已知悉该操作会让设备重新加载作业区域</el-checkbox>
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="registerVisible = false">取消</el-button>
				<el-button type="primary" :loading="submitting" @click="submitRegister">登记</el-button>
			</template>
		</el-dialog>

		<!-- 距离快照 -->
		<el-drawer v-model="locationVisible" title="飞行器与飞行区距离快照" size="55%">
			<el-alert type="info" :closable="false" show-icon class="mb10">
				<template #title>
					<span class="text-xs">
						每机场每区域<b>只有一行</b>（不随时间增长）：保留的是「历史最近距离」与「累计进入次数」，
						而不是逐条距离流水 —— 后者没有回溯价值。
					</span>
				</template>
			</el-alert>

			<el-table :data="locations" size="small" border v-loading="locationLoading">
				<el-table-column label="区域 ID" min-width="180">
					<template #default="scope"><span class="font-mono text-xs">{{ scope.row.areaId }}</span></template>
				</el-table-column>
				<el-table-column label="是否在区内" width="110" align="center">
					<template #default="scope">
						<el-tag v-if="scope.row.isInArea" type="danger" size="small" effect="dark">区内</el-tag>
						<el-tag v-else type="success" size="small" effect="plain">区外</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="距边界" width="110" align="right">
					<template #default="scope">{{ formatDistance(scope.row.areaDistance) }}</template>
				</el-table-column>
				<el-table-column label="历史最近" width="110" align="right">
					<template #default="scope">{{ formatDistance(scope.row.minDistance) }}</template>
				</el-table-column>
				<el-table-column prop="enterCount" label="进入次数" width="100" align="center" />
				<el-table-column prop="lastEnterTime" label="最近进入" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.lastEnterTime) }}</template>
				</el-table-column>
				<el-table-column prop="lastExitTime" label="最近离开" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.lastExitTime) }}</template>
				</el-table-column>
				<el-table-column prop="lastTime" label="最近刷新" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.lastTime) }}</template>
				</el-table-column>
			</el-table>
		</el-drawer>
	</div>
</template>

<script setup lang="ts" name="djiFlightArea">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import {
	deleteDjiFlightArea,
	dockOptionsDjiFlightArea,
	locationsDjiFlightArea,
	pageDjiFlightArea,
	registerDjiFlightArea,
	syncReasonOptionsDjiFlightArea,
	syncStatusOptionsDjiFlightArea,
	updateDjiFlightArea,
} from '/@/api/main/djiFlightArea';

/** 与后端 FlightAreaSyncStatusEnum 对应（0 待同步 / 1 同步中 / 2 已同步 / 3 失败 / 4 使能失败） */
const SyncStatus = { WaitSync: 0, Synchronizing: 1, Synchronized: 2, Fail: 3, SwitchFail: 4 };

const loading = ref(false);
const submitting = ref(false);
const locationLoading = ref(false);

const tableData = ref<any[]>([]);
const selection = ref<any[]>([]);
const queryParams = ref<any>({});
const tableParams = ref({ page: 1, pageSize: 20, total: 0 });
const onlyActive = ref(false);

const docks = ref<any[]>([]);
const syncStatusOptions = ref<{ value: number; label: string }[]>([]);
const syncReasonOptions = ref<{ value: number; label: string }[]>([]);

const registerVisible = ref(false);
const registerForm = ref<any>({ dockSn: '', fileName: '', objectKey: '', checksum: '', syncImmediately: true, confirm: false });

const locationVisible = ref(false);
const locationDockSn = ref<string>('');
const locations = ref<any[]>([]);

onMounted(async () => {
	await Promise.all([loadDocks(), loadSyncStatusOptions(), loadSyncReasonOptions()]);
	await handleQuery();
});

/* ------------------------------ 字典与下拉 ------------------------------ */

async function loadDocks(workspaceId?: string) {
	try {
		const res = await dockOptionsDjiFlightArea(workspaceId || queryParams.value.workspaceId);
		docks.value = res.data.result ?? [];
	} catch {
		docks.value = [];
	}
}

async function loadSyncStatusOptions() {
	try {
		const res = await syncStatusOptionsDjiFlightArea();
		syncStatusOptions.value = res.data.result ?? [];
	} catch {
		syncStatusOptions.value = [];
	}
}

/**
 * 失败原因字典本页面暂未用于下拉（列表直接用后端返回的文字），
 * 但仍加载一次：它能证明字典接口可用，也方便后续加「按原因筛选」。
 */
async function loadSyncReasonOptions() {
	try {
		const res = await syncReasonOptionsDjiFlightArea();
		syncReasonOptions.value = res.data.result ?? [];
	} catch {
		syncReasonOptions.value = [];
	}
}

/* ------------------------------ 查询 ------------------------------ */

function handleOnlyActiveChange() {
	tableParams.value.page = 1;
	handleQuery();
}

async function handleQuery() {
	loading.value = true;
	try {
		const res = await pageDjiFlightArea(
			Object.assign({}, queryParams.value, tableParams.value, { onlyActive: onlyActive.value || undefined })
		);
		tableData.value = res.data.result?.items ?? [];
		tableParams.value.total = res.data.result?.total ?? 0;
	} finally {
		loading.value = false;
	}
}

function resetQuery() {
	queryParams.value = {};
	onlyActive.value = false;
	tableParams.value.page = 1;
	loadDocks();
	handleQuery();
}

function handleWorkspaceChange() {
	queryParams.value.dockSn = undefined;
	loadDocks(queryParams.value.workspaceId);
	tableParams.value.page = 1;
	handleQuery();
}

function handleSelectionChange(rows: any[]) {
	selection.value = rows ?? [];
}

/* ------------------------------ 登记 ------------------------------ */

function openRegister() {
	registerVisible.value = true;
	if (!registerForm.value.dockSn && docks.value.length === 1) registerForm.value.dockSn = docks.value[0].sn;
}

function resetRegister() {
	registerForm.value = { dockSn: '', fileName: '', objectKey: '', checksum: '', syncImmediately: true, confirm: false };
}

async function submitRegister() {
	if (!registerForm.value.dockSn) return ElMessage.warning('请选择目标机场');
	if (!registerForm.value.fileName) return ElMessage.warning('请填写文件名');
	if (!registerForm.value.objectKey) return ElMessage.warning('请填写对象存储地址');
	if (registerForm.value.syncImmediately && !registerForm.value.confirm) return ElMessage.warning('请勾选确认后再下发同步通知');

	submitting.value = true;
	try {
		await registerDjiFlightArea({
			dockSn: registerForm.value.dockSn,
			fileName: registerForm.value.fileName,
			objectKey: registerForm.value.objectKey,
			checksum: registerForm.value.checksum || undefined,
			syncImmediately: registerForm.value.syncImmediately,
			confirm: registerForm.value.confirm,
		});
		ElMessage.success(registerForm.value.syncImmediately ? '已登记并通知设备同步' : '已登记');
		registerVisible.value = false;
		await handleQuery();
	} finally {
		submitting.value = false;
	}
}

/* ------------------------------ 通知同步 ------------------------------ */

/**
 * 通知设备重新拉取并启用飞行区文件。
 *
 * 这条指令没有入参（协议 data=null），设备收到后自行决定何时来要地址，
 * 因此这里限定「一次只选一台机场」—— 选多台反而会让用户以为能批量。
 */
async function handleNotify() {
	if (selection.value.length !== 1) return;
	const row = selection.value[0];
	await ElMessageBox.confirm(
		`确定要通知【${row.dockNick || row.dockSn}】重新拉取并启用飞行区文件吗？设备会重新加载作业区域（飞行器需开机、图传需让出链路）。`,
		'下发确认',
		{ type: 'warning', confirmButtonText: '确认下发', cancelButtonText: '取消' }
	);
	try {
		await updateDjiFlightArea({ dockSn: row.dockSn, confirm: true });
		ElMessage.success('已下发同步通知，请在设备上报同步进度后查看结果');
		selection.value = [];
		await handleQuery();
	} catch {
		await handleQuery();
	}
}

/* ------------------------------ 删除 ------------------------------ */

async function handleBatchDelete() {
	if (selection.value.length === 0) return;
	await ElMessageBox.confirm(
		`确定要删除选中的 ${selection.value.length} 条飞行区记录吗？只删记录、不删对象存储里的文件，可在误删后重新登记。`,
		'删除确认',
		{ type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
	);
	try {
		await deleteDjiFlightArea(selection.value.map((m) => m.id));
		ElMessage.success('删除成功');
		selection.value = [];
		await handleQuery();
	} catch {
		// 请求拦截器已提示错误
	}
}

/* ------------------------------ 距离快照 ------------------------------ */

async function openLocations() {
	if (!locationDockSn.value) {
		ElMessage.warning('请先选择要查看的机场');
		return;
	}
	locationVisible.value = true;
	locationLoading.value = true;
	try {
		const res = await locationsDjiFlightArea(locationDockSn.value);
		locations.value = res.data.result ?? [];
	} finally {
		locationLoading.value = false;
	}
}

/* ------------------------------ 展示辅助 ------------------------------ */

function formatDateTime(value?: string) {
	if (!value) return '';
	return formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS');
}

/** 摘要是 64 位十六进制，全量展示没有可读性，只留头尾便于人工比对 */
function shortDigest(checksum?: string) {
	if (!checksum) return '-';
	return checksum.length <= 16 ? checksum : `${checksum.slice(0, 8)}…${checksum.slice(-4)}`;
}

/**
 * 距离取绝对值展示。
 *
 * 官方文档没有说明「在区内」时 area_distance 是正还是负，
 * 因此对符号不做任何假设 —— 判断在区内外只用 isInArea 这个明确布尔字段。
 */
function formatDistance(value?: number) {
	if (value == null) return '-';
	return `${Math.abs(value).toFixed(1)} m`;
}

function syncTagType(status: number) {
	if (status === SyncStatus.Synchronized) return 'success';
	if (status === SyncStatus.Synchronizing) return 'primary';
	if (status === SyncStatus.WaitSync) return 'info';
	return 'danger';
}
</script>
