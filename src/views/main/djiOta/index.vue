<template>
	<div class="djiOta-container">
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
						<el-form-item label="任务状态">
							<el-select v-model="queryParams.status" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="升级类型">
							<el-select v-model="queryParams.upgradeType" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="批次">
							<el-select v-model="queryParams.batchId" clearable filterable placeholder="全部批次" @change="handleQuery">
								<el-option v-for="item in batchOptions" :key="item.batchId" :label="item.label" :value="item.batchId" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="设备 SN">
							<el-input v-model="queryParams.deviceSn" clearable placeholder="模糊匹配" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" class="mb10">
						<el-form-item label="下发时间">
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
			<div class="mb10">
				<el-button type="primary" icon="ele-Upload" @click="openCreate"> 新建升级任务 </el-button>
				<el-button icon="ele-Refresh" @click="handleQuery"> 刷新 </el-button>
				<span class="ml-4 text-xs c-gray">
					一次任务是<b>一个批次</b>：<span class="font-mono">ota_progress</span> 报文里不含设备 SN，进度天然是批次级的；要看单个设备请点「详情」。
				</span>
			</div>

			<el-table :data="tableData" style="width: 100%" v-loading="loading" size="small" border row-key="id">
				<el-table-column label="批次" width="120">
					<template #default="scope">
						<span class="font-mono text-xs">{{ shortBatch(scope.row.batchId) }}</span>
						<el-tooltip :content="scope.row.batchId" placement="top">
							<el-icon class="ml-1 c-gray"><ele-InfoFilled /></el-icon>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="机场" width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn || '-' }}</template>
				</el-table-column>
				<el-table-column prop="scopeName" label="升级范围" width="130" />
				<el-table-column label="设备数" width="80" align="center">
					<template #default="scope">
						<el-tooltip :content="scope.row.deviceSns || ''" placement="top">
							<span>{{ scope.row.deviceCount }}</span>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="版本" min-width="170">
					<template #default="scope">
						<div class="font-mono text-xs">{{ scope.row.currentVersion || '-' }} → {{ scope.row.targetVersion }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="upgradeTypeName" label="升级类型" width="110" align="center" />
				<el-table-column label="状态" width="100" align="center">
					<template #default="scope">
						<el-tag size="small" effect="plain" :type="statusTagType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="进度" min-width="160">
					<template #default="scope">
						<el-progress v-if="scope.row.isRunning" :percentage="scope.row.percent ?? 0" :stroke-width="10" />
						<span v-else class="text-xs c-gray">{{ scope.row.currentStepName || '-' }}</span>
						<div v-if="scope.row.currentStepName" class="text-xs c-gray">{{ scope.row.currentStepName }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="errorMessage" label="结果说明" min-width="160" show-overflow-tooltip>
					<template #default="scope">
						<span :class="{ 'c-danger': scope.row.result !== 0 }">
							{{ scope.row.errorMessage || (scope.row.result === 0 ? '成功' : `错误码 ${scope.row.result}`) }}
						</span>
					</template>
				</el-table-column>
				<el-table-column prop="operatorName" label="操作人" width="110" />
				<el-table-column prop="createTime" label="下发时间" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.createTime) }}</template>
				</el-table-column>
				<el-table-column label="操作" width="80" align="center" fixed="right">
					<template #default="scope">
						<el-button icon="ele-InfoFilled" size="small" text type="info" @click="openDetail(scope.row)">详情</el-button>
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

		<!-- 任务详情：逐设备明细 -->
		<el-drawer v-model="detailVisible" title="升级任务详情" size="55%">
			<el-descriptions v-if="detail" :column="2" border size="small" class="mb10">
				<el-descriptions-item label="批次号" :span="2"><span class="font-mono text-xs">{{ detail.batchId }}</span></el-descriptions-item>
				<el-descriptions-item label="机场">{{ detail.dockNick || detail.dockSn }}</el-descriptions-item>
				<el-descriptions-item label="升级范围">{{ detail.scopeName }}</el-descriptions-item>
				<el-descriptions-item label="当前版本">{{ detail.currentVersion || '-' }}</el-descriptions-item>
				<el-descriptions-item label="目标版本">{{ detail.targetVersion }}</el-descriptions-item>
				<el-descriptions-item label="升级类型">{{ detail.upgradeTypeName }}</el-descriptions-item>
				<el-descriptions-item label="任务状态">{{ detail.statusName }}</el-descriptions-item>
				<el-descriptions-item label="进度百分比">{{ detail.percent ?? 0 }}%</el-descriptions-item>
				<el-descriptions-item label="当前步骤">{{ detail.currentStepName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="结果说明" :span="2">
					<span :class="{ 'c-danger': detail.result !== 0 }">
						{{ detail.errorMessage || (detail.result === 0 ? '成功' : `错误码 ${detail.result}`) }}
					</span>
				</el-descriptions-item>
				<el-descriptions-item label="操作人">{{ detail.operatorName }}</el-descriptions-item>
				<el-descriptions-item label="下发时间">{{ formatDateTime(detail.createTime) }}</el-descriptions-item>
				<el-descriptions-item label="结束时间">{{ formatDateTime(detail.finishTime) }}</el-descriptions-item>
			</el-descriptions>

			<div class="text-xs c-gray mb-1">本次参与升级的设备（{{ detail?.devices?.length ?? 0 }} 台）</div>
			<el-table :data="detail?.devices ?? []" size="small" border>
				<el-table-column label="设备 SN" min-width="180">
					<template #default="scope"><span class="font-mono text-xs">{{ scope.row.sn }}</span></template>
				</el-table-column>
				<el-table-column prop="deviceName" label="设备" width="140" show-overflow-tooltip />
				<el-table-column label="类型" width="90" align="center">
					<template #default="scope">
						<el-tag size="small" effect="plain" :type="scope.row.isDock ? 'info' : 'primary'">{{ scope.row.isDock ? '机场' : '飞行器' }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="productVersion" label="目标版本" width="130" />
				<el-table-column prop="fileName" label="固件包" min-width="160" show-overflow-tooltip />
				<el-table-column label="包大小" width="100" align="right">
					<template #default="scope">{{ formatSize(scope.row.fileSize) }}</template>
				</el-table-column>
				<el-table-column prop="md5" label="MD5" width="120" show-overflow-tooltip>
					<template #default="scope"><span class="font-mono text-xs">{{ scope.row.md5 || '-' }}</span></template>
				</el-table-column>
			</el-table>
		</el-drawer>

		<!-- 新建升级任务 -->
		<el-dialog v-model="createVisible" title="新建固件升级任务" width="900px" @closed="resetCreate">
			<el-alert type="warning" :closable="false" show-icon class="mb10">
				<template #title>
					<span class="text-xs">
						升级会中断作业、耗时可达数十分钟，且部分老固件无法回退。飞行器必须<b>在舱</b>才允许升级；
						一致性升级与飞行器固件升级期间<b>请勿离舱</b>。
					</span>
				</template>
			</el-alert>

			<el-form :model="createForm" label-width="100">
				<el-row>
					<el-col :span="12">
						<el-form-item label="目标机场">
							<el-select v-model="createForm.dockSn" filterable placeholder="请选择机场" style="width: 100%" @change="handleCreateDockChange">
								<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="升级类型">
							<el-radio-group v-model="createForm.upgradeType" @change="handleTypeChange">
								<el-radio-button v-for="item in typeOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>

				<el-form-item v-if="!needPackage" label="统一版本">
					<el-input v-model="defaultVersion" placeholder="如 1.00.223，点击右侧按钮批量填入" style="width: 320px">
						<template #append>
							<el-button @click="fillVersion">填入勾选设备</el-button>
						</template>
					</el-input>
					<span class="text-xs c-gray ml-2">仅一致性升级需要版本号，设备自行从 DJI 服务器取包</span>
				</el-form-item>

				<el-form-item v-else label="统一固件包">
					<el-input v-model="defaultFileUrl" placeholder="固件包下载地址 (file_url)" style="width: 320px" class="mb-1" />
					<el-input v-model="defaultMd5" placeholder="固件包 MD5" style="width: 240px" class="ml-2" />
					<el-button class="ml-2" @click="fillPackage">填入勾选设备</el-button>
					<div class="text-xs c-gray">普通升级 / PSDK 升级必须由云端提供完整包信息，否则设备无处下载</div>
				</el-form-item>
			</el-form>

			<div class="text-xs c-gray mb-1">选择待升级设备（同批次允许同时包含机场与飞行器，这是官方推荐用法）</div>
			<el-table
				:data="devices"
				size="small"
				border
				max-height="320"
				@selection-change="handleDeviceSelectionChange"
			>
				<el-table-column type="selection" width="45" align="center" />
				<el-table-column label="设备 SN" min-width="180">
					<template #default="scope"><span class="font-mono text-xs">{{ scope.row.sn }}</span></template>
				</el-table-column>
				<el-table-column prop="label" label="设备" min-width="160" show-overflow-tooltip />
				<el-table-column prop="firmwareVersion" label="当前版本" width="130" />
				<el-table-column label="目标版本" width="140">
					<template #default="scope">
						<el-input v-model="scope.row.targetVersion" size="small" placeholder="必填" />
					</template>
				</el-table-column>
				<template v-if="needPackage">
					<el-table-column label="固件包地址" min-width="180">
						<template #default="scope">
							<el-input v-model="scope.row.fileUrl" size="small" placeholder="必填" />
						</template>
					</el-table-column>
					<el-table-column label="MD5" width="140">
						<template #default="scope">
							<el-input v-model="scope.row.md5" size="small" placeholder="必填" />
						</template>
					</el-table-column>
					<el-table-column label="大小(字节)" width="120">
						<template #default="scope">
							<el-input-number v-model="scope.row.fileSize" size="small" :min="1" controls-position="right" />
						</template>
					</el-table-column>
					<el-table-column label="文件名" width="150">
						<template #default="scope">
							<el-input v-model="scope.row.fileName" size="small" placeholder="必填" />
						</template>
					</el-table-column>
				</template>
			</el-table>

			<el-checkbox v-model="createForm.confirm" class="mt10">我已确认现场具备升级条件（机场空闲、飞行器在舱、已通知相关人员）</el-checkbox>

			<template #footer>
				<el-button @click="createVisible = false">取消</el-button>
				<el-button type="primary" :loading="submitting" @click="submitCreate">创建任务</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="djiOta">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import {
	batchOptionsDjiOta,
	createDjiOta,
	detailDjiOta,
	devicesDjiOta,
	pageDjiOta,
	statusOptionsDjiOta,
	upgradeTypeOptionsDjiOta,
} from '/@/api/main/djiOta';
// OTA 模块没有自己的机场下拉：与机场控制面板共用同一份，
// 避免同一台机场在不同页面显示不同名称
import { dockOptionsDjiDock } from '/@/api/main/djiDock';

/** 与后端 OtaUpgradeTypeEnum 对应（2 一致性 / 3 普通 / 4 PSDK），注意没有 0 和 1 */
const UpgradeType = { Consistency: 2, Normal: 3, Psdk: 4 };

const loading = ref(false);
const tableData = ref<any[]>([]);
const queryParams = ref<any>({});
const tableParams = ref({ page: 1, pageSize: 20, total: 0 });
const dateRange = ref<any>(null);
const defaultTime = ref<[Date, Date]>([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]);

const docks = ref<any[]>([]);
const statusOptions = ref<{ value: number; label: string }[]>([]);
const typeOptions = ref<{ value: number; label: string }[]>([]);
const batchOptions = ref<any[]>([]);

const detailVisible = ref(false);
const detail = ref<any>(null);

const createVisible = ref(false);
const submitting = ref(false);
const devices = ref<any[]>([]);
const selectedDevices = ref<any[]>([]);
const createForm = ref<any>({ dockSn: '', upgradeType: UpgradeType.Consistency, confirm: false });
const defaultVersion = ref('');
const defaultFileUrl = ref('');
const defaultMd5 = ref('');

onMounted(async () => {
	await Promise.all([loadDocks(), loadStatusOptions(), loadTypeOptions(), loadBatchOptions()]);
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

async function loadStatusOptions() {
	try {
		const res = await statusOptionsDjiOta();
		statusOptions.value = res.data.result ?? [];
	} catch {
		statusOptions.value = [];
	}
}

async function loadTypeOptions() {
	try {
		const res = await upgradeTypeOptionsDjiOta();
		typeOptions.value = res.data.result ?? [];
	} catch {
		typeOptions.value = [];
	}
}

async function loadBatchOptions() {
	try {
		const res = await batchOptionsDjiOta(queryParams.value.dockSn);
		batchOptions.value = res.data.result ?? [];
	} catch {
		batchOptions.value = [];
	}
}

/* ------------------------------ 查询 ------------------------------ */

async function handleQuery() {
	loading.value = true;
	try {
		const res = await pageDjiOta(
			Object.assign({}, queryParams.value, tableParams.value, {
				startTime: dateRange.value?.[0],
				endTime: dateRange.value?.[1],
			})
		);
		tableData.value = res.data.result?.items ?? [];
		tableParams.value.total = res.data.result?.total ?? 0;
	} finally {
		loading.value = false;
	}
}

function resetQuery() {
	queryParams.value = {};
	dateRange.value = null;
	tableParams.value.page = 1;
	loadBatchOptions();
	handleQuery();
}

function handleWorkspaceChange() {
	queryParams.value.dockSn = undefined;
	tableParams.value.page = 1;
	handleQuery();
}

/* ------------------------------ 详情 ------------------------------ */

async function openDetail(row: any) {
	try {
		const res = await detailDjiOta(row.id);
		detail.value = res.data.result ?? row;
		detailVisible.value = true;
	} catch {
		ElMessage.error('获取任务详情失败');
	}
}

/* ------------------------------ 新建任务 ------------------------------ */

/** 一致性升级由设备自行取包，不需要云端提供地址 */
const needPackage = computed(() => createForm.value.upgradeType !== UpgradeType.Consistency);

function openCreate() {
	createVisible.value = true;
	if (!createForm.value.dockSn && docks.value.length === 1) {
		createForm.value.dockSn = docks.value[0].sn;
		loadDevices();
	}
}

function resetCreate() {
	devices.value = [];
	selectedDevices.value = [];
	createForm.value = { dockSn: '', upgradeType: UpgradeType.Consistency, confirm: false };
	defaultVersion.value = '';
	defaultFileUrl.value = '';
	defaultMd5.value = '';
}

async function handleCreateDockChange() {
	devices.value = [];
	selectedDevices.value = [];
	await loadDevices();
}

async function loadDevices() {
	if (!createForm.value.dockSn) return;
	try {
		const res = await devicesDjiOta(createForm.value.dockSn);
		devices.value = (res.data.result ?? []).map((m: any) => ({
			...m,
			targetVersion: '',
			fileUrl: '',
			md5: '',
			fileSize: null,
			fileName: '',
		}));
	} catch {
		devices.value = [];
	}
}

function handleTypeChange() {
	// 切类型后旧的参数语义就变了（例如一致性不需要包名），清空避免提交出半成品载荷
	devices.value = devices.value.map((m) => ({ ...m, targetVersion: '', fileUrl: '', md5: '', fileSize: null, fileName: '' }));
}

function handleDeviceSelectionChange(rows: any[]) {
	selectedDevices.value = rows ?? [];
}

function fillVersion() {
	if (!defaultVersion.value) {
		ElMessage.warning('请先填写版本号');
		return;
	}
	selectedDevices.value.forEach((m) => {
		m.targetVersion = defaultVersion.value;
	});
}

function fillPackage() {
	if (!defaultFileUrl.value) {
		ElMessage.warning('请先填写固件包下载地址');
		return;
	}
	const fileName = defaultFileUrl.value.split('/').pop()?.split('?')[0] ?? '';
	selectedDevices.value.forEach((m) => {
		m.fileUrl = defaultFileUrl.value;
		m.md5 = defaultMd5.value;
		m.fileName = m.fileName || fileName;
	});
	// 包大小无法从 URL 推出来（设备侧要拿它做完整性校验），必须人工确认后在表格里逐行填写
	if (fileName) ElMessage.info('文件名已尝试从下载地址推导，包大小请逐行确认');
}

async function submitCreate() {
	if (!createForm.value.dockSn) return ElMessage.warning('请选择目标机场');
	if (!createForm.value.confirm) return ElMessage.warning('请先确认现场具备升级条件');

	const payload = selectedDevices.value.map((m) => ({
		deviceSn: m.sn,
		targetVersion: m.targetVersion,
		fileUrl: m.fileUrl,
		md5: m.md5,
		fileSize: m.fileSize,
		fileName: m.fileName,
	}));

	if (payload.length === 0) return ElMessage.warning('请至少勾选一台设备');

	const missingVersion = payload.filter((m) => !m.targetVersion);
	if (missingVersion.length > 0) return ElMessage.warning('请为所有勾选设备填写目标版本');

	if (needPackage.value) {
		const missingPkg = payload.filter((m) => !m.fileUrl || !m.md5 || !m.fileSize || !m.fileName);
		if (missingPkg.length > 0) return ElMessage.warning('普通升级 / PSDK 升级需要填写完整的固件包信息（地址、MD5、大小、文件名）');
	}

	submitting.value = true;
	try {
		await createDjiOta({
			dockSn: createForm.value.dockSn,
			devices: payload,
			confirm: true,
		});
		ElMessage.success(`已创建升级任务，共 ${payload.length} 台设备`);
		createVisible.value = false;
		await Promise.all([handleQuery(), loadBatchOptions()]);
	} finally {
		submitting.value = false;
	}
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

/** 批次号是 GUID，全量展示会把列撑爆，这里只留尾段；完整值放 tooltip */
function shortBatch(batchId?: string) {
	if (!batchId) return '-';
	return batchId.length <= 8 ? batchId : batchId.slice(-8);
}

/** 与后端 OtaTaskStatusEnum 对应；2 成功、3 失败、4 取消 */
function statusTagType(status: number) {
	if (status === 2) return 'success';
	if (status === 3) return 'danger';
	if (status === 4) return 'info';
	return 'warning';
}
</script>
