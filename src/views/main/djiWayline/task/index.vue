<template>
	<div class="djiWaylineTask-container">
		<!-- 查询条件 -->
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" ref="queryForm" label-width="80">
				<el-row>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="空间">
							<workspaceSelect v-model:id="queryParams.workspaceId" @update:id="handleWorkspaceChange"></workspaceSelect>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="执行机场">
							<el-select v-model="queryParams.dockSn" clearable filterable placeholder="全部机场">
								<el-option v-for="dock in docks" :key="dock.sn" :label="dockLabel(dock)" :value="dock.sn" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="3" class="mb10">
						<el-form-item label="状态">
							<el-select v-model="queryParams.status" clearable placeholder="全部状态">
								<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="3" class="mb10">
						<el-form-item label="任务类型">
							<el-select v-model="queryParams.taskType" clearable placeholder="全部类型">
								<el-option v-for="item in taskTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="关键字">
							<el-input v-model="queryParams.searchKey" clearable placeholder="任务名 / 计划ID / 航线名" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="6" class="mb10">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="resetQuery"> 重置 </el-button>
							</el-button-group>
							<el-button-group style="margin-left: 20px">
								<el-button type="primary" icon="ele-Promotion" @click="openDispatch()"> 下发任务 </el-button>
							</el-button-group>
							<el-checkbox v-model="queryParams.onlyActive" class="ml-4" @change="handleQuery"> 只看进行中 </el-checkbox>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<!-- 任务列表 -->
		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<el-table :data="tableData" style="width: 100%" v-loading="loading" tooltip-effect="light" row-key="id" border>
				<el-table-column type="index" label="序号" width="55" align="center" />
				<el-table-column prop="jobName" label="任务名称" min-width="160" show-overflow-tooltip />
				<el-table-column prop="waylineName" label="航线" min-width="140" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.waylineName || '-' }}</template>
				</el-table-column>
				<el-table-column prop="dockSn" label="执行机场" width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn || '-' }}</template>
				</el-table-column>
				<el-table-column prop="taskType" label="类型" width="80" align="center">
					<template #default="scope">
						<el-tag effect="plain" :type="taskTypeTagType(scope.row.taskType)">{{ taskTypeLabel(scope.row.taskType) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="状态" width="95" align="center">
					<template #default="scope">
						<el-tag :type="statusTagType(scope.row.status)">{{ scope.row.statusText || scope.row.status }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="progressPercent" label="进度" width="170">
					<template #default="scope">
						<el-progress :percentage="scope.row.progressPercent ?? 0" :stroke-width="10" :status="progressStatus(scope.row.status)" />
					</template>
				</el-table-column>
				<el-table-column prop="stepText" label="当前步骤" min-width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.stepText || '-' }}</template>
				</el-table-column>
				<el-table-column prop="currentWaypointIndex" label="航点" width="70" align="center">
					<template #default="scope">{{ scope.row.currentWaypointIndex || 0 }}</template>
				</el-table-column>
				<el-table-column prop="mediaCount" label="媒体" width="70" align="center">
					<template #default="scope">{{ scope.row.mediaCount || 0 }}</template>
				</el-table-column>
				<el-table-column prop="executeTime" label="计划执行时间" width="160">
					<template #default="scope">{{ formatTimestamp(scope.row.executeTime) }}</template>
				</el-table-column>
				<el-table-column prop="beginTime" label="开始时间" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.beginTime) }}</template>
				</el-table-column>
				<el-table-column prop="errorMessage" label="失败原因" min-width="160" show-overflow-tooltip>
					<template #default="scope">
						<el-tooltip v-if="scope.row.errorMessage" :content="scope.row.errorCode ? `错误码 ${scope.row.errorCode}` : ''" placement="top">
							<span class="c-danger">{{ scope.row.errorMessage }}</span>
						</el-tooltip>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="290" align="center" fixed="right">
					<template #default="scope">
						<el-button icon="ele-View" size="small" text type="primary" @click="openDetail(scope.row)">详情</el-button>
						<el-button v-if="canExecute(scope.row)" icon="ele-VideoPlay" size="small" text type="success" @click="handleExecute(scope.row)">执行</el-button>
						<el-button v-if="scope.row.status === 'in_progress'" icon="ele-VideoPause" size="small" text type="warning" @click="handlePause(scope.row)">暂停</el-button>
						<el-button v-if="scope.row.status === 'paused'" icon="ele-VideoPlay" size="small" text type="success" @click="handleRecovery(scope.row)">恢复</el-button>
						<el-button v-if="!scope.row.isActive" icon="ele-RefreshLeft" size="small" text type="primary" @click="openDispatch(scope.row)">重发</el-button>
						<el-dropdown v-if="scope.row.isActive" trigger="click" @command="(cmd: string) => handleMoreCommand(cmd, scope.row)">
							<el-button icon="ele-MoreFilled" size="small" text type="primary">更多</el-button>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item command="undo" icon="ele-CircleClose">取消任务</el-dropdown-item>
									<el-dropdown-item command="stop" icon="ele-SwitchButton">结束任务</el-dropdown-item>
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
				:page-sizes="[10, 20, 50, 100]"
				small
				background
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleQuery"
				@current-change="handleQuery"
			/>
		</el-card>

		<!-- 下发任务 -->
		<el-dialog v-model="dispatchVisible" title="下发航线任务" width="640px" :close-on-click-modal="false" @closed="resetDispatchForm">
			<el-form :model="dispatchForm" :rules="dispatchRules" ref="dispatchFormRef" label-width="110">
				<el-form-item label="航线" prop="waylineEntityId">
					<el-select v-model="dispatchForm.waylineEntityId" filterable placeholder="请选择要执行的航线" style="width: 100%">
						<el-option v-for="w in waylines" :key="w.id" :label="w.waylineName" :value="w.id">
							<span>{{ w.waylineName }}</span>
							<span class="ml-2 c-gray">{{ w.templateStr || '' }} · {{ w.pointCount ?? 0 }} 航点</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="执行机场" prop="dockSn">
					<el-select v-model="dispatchForm.dockSn" filterable placeholder="请选择执行机场" style="width: 100%">
						<el-option v-for="dock in docks" :key="dock.sn" :label="dockLabel(dock)" :value="dock.sn" :disabled="!dock.canDispatch">
							<span>{{ dock.nick || dock.sn }}</span>
							<span class="ml-2 text-xs" :class="dock.canDispatch ? 'c-success' : 'c-danger'">{{ dockHint(dock) }}</span>
						</el-option>
					</el-select>
					<div class="text-xs c-gray leading-4 mt-1">
						仅「在线且无未结束任务」的机场可下发；同一机场同时只允许一个未结束任务。
					</div>
				</el-form-item>
				<el-form-item label="任务类型" prop="taskType">
					<el-radio-group v-model="dispatchForm.taskType">
						<el-radio-button v-for="item in taskTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="任务名称">
					<el-input v-model="dispatchForm.jobName" maxlength="64" placeholder="留空则使用航线名称" />
				</el-form-item>
				<el-form-item v-if="dispatchForm.taskType !== 0" label="计划执行时间" prop="executeTime">
					<el-date-picker
						v-model="dispatchForm.executeTime"
						type="datetime"
						placeholder="请选择执行时间"
						value-format="YYYY-MM-DD HH:mm:ss"
						style="width: 100%"
					/>
					<div class="text-xs c-gray leading-4 mt-1">
						定时任务最多提前 24 小时下发，执行前 2 分钟由后台自动触发执行；立即任务忽略此项（服务端取当前时间，机场仅允许 30 秒误差）。
					</div>
				</el-form-item>
				<template v-if="dispatchForm.taskType === 2">
					<el-divider content-position="left">准备条件（满足后机场主动通知就绪）</el-divider>
					<el-form-item label="最低电量">
						<el-input-number v-model="dispatchForm.batteryCapacity" :min="0" :max="100" :step="5" /> <span class="ml-2 text-xs c-gray">%，飞行器电量需高于该值</span>
					</el-form-item>
					<el-form-item label="可执行时段">
						<el-date-picker
							v-model="dispatchForm.readyWindow"
							type="datetimerange"
							range-separator="至"
							start-placeholder="开始"
							end-placeholder="结束"
							value-format="YYYY-MM-DD HH:mm:ss"
							style="width: 100%"
						/>
					</el-form-item>
				</template>
				<el-divider content-position="left">飞行参数</el-divider>
				<el-form-item label="返航高度">
					<el-input-number v-model="dispatchForm.rthAltitude" :min="20" :max="1500" :step="10" />
					<span class="ml-2 text-xs c-gray">米，取值 20–1500；留空则取航线自带的返航高度</span>
				</el-form-item>
				<el-form-item label="失控动作">
					<el-radio-group v-model="dispatchForm.outOfControlAction">
						<el-radio :value="0">返航</el-radio>
						<el-radio :value="1">悬停</el-radio>
						<el-radio :value="2">降落</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dispatchVisible = false">取消</el-button>
				<el-button type="primary" :loading="dispatching" @click="submitDispatch">确定下发</el-button>
			</template>
		</el-dialog>

		<!-- 任务详情 -->
		<el-drawer v-model="detailVisible" title="任务详情" size="55%" @closed="detailProgress = []">
			<el-descriptions v-if="detail" :column="2" border size="small">
				<el-descriptions-item label="任务名称">{{ detail.jobName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="计划ID">
					<span class="font-mono text-xs">{{ detail.flightId }}</span>
				</el-descriptions-item>
				<el-descriptions-item label="状态">
					<el-tag :type="statusTagType(detail.status)">{{ detail.statusText || detail.status }}</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="当前步骤">{{ detail.stepText || '-' }}</el-descriptions-item>
				<el-descriptions-item label="航线">{{ detail.waylineName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="协议航线ID">{{ detail.waylineId ?? '-' }}</el-descriptions-item>
				<el-descriptions-item label="执行机场">{{ detail.dockNick || detail.dockSn || '-' }}</el-descriptions-item>
				<el-descriptions-item label="执行飞行器">{{ detail.droneSn || '-' }}</el-descriptions-item>
				<el-descriptions-item label="任务类型">{{ taskTypeLabel(detail.taskType) }}</el-descriptions-item>
				<el-descriptions-item label="计划执行时间">{{ formatTimestamp(detail.executeTime) }}</el-descriptions-item>
				<el-descriptions-item label="就绪时间">{{ formatDateTime(detail.readyTime) }}</el-descriptions-item>
				<el-descriptions-item label="开始时间">{{ formatDateTime(detail.beginTime) }}</el-descriptions-item>
				<el-descriptions-item label="结束时间">{{ formatDateTime(detail.endTime) }}</el-descriptions-item>
				<el-descriptions-item label="媒体文件数">{{ detail.mediaCount ?? 0 }}</el-descriptions-item>
				<el-descriptions-item label="返航高度">{{ detail.rthAltitude ?? '-' }} m</el-descriptions-item>
				<el-descriptions-item label="失控动作">{{ outOfControlLabel(detail.outOfControlAction) }}</el-descriptions-item>
				<el-descriptions-item label="KMZ 文件" :span="2">{{ detail.kmzFileName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="KMZ 签名" :span="2">
					<span class="font-mono text-xs">{{ detail.fingerprint || '-' }}</span>
				</el-descriptions-item>
				<el-descriptions-item v-if="detail.errorMessage" label="失败原因" :span="2">
					<span class="c-danger">{{ detail.errorMessage }}（错误码 {{ detail.errorCode }}）</span>
				</el-descriptions-item>
			</el-descriptions>

			<div v-if="detail?.breakPointJson" class="mt-4">
				<el-alert type="warning" :closable="false" title="任务存在断点信息，可从断点续飞（本期暂未开放续飞入口）">
					<pre class="text-xs whitespace-pre-wrap break-all m-0">{{ prettyJson(detail.breakPointJson) }}</pre>
				</el-alert>
			</div>

			<el-divider content-position="left">进度时间线</el-divider>
			<el-empty v-if="!detailProgress.length" description="暂无进度上报" />
			<el-timeline v-else>
				<el-timeline-item
					v-for="item in detailProgress"
					:key="item.id"
					:timestamp="formatDateTime(item.createTime)"
					:type="statusTagType(item.status)"
					placement="top"
				>
					<div class="flex items-center gap-2">
						<el-tag size="small" :type="statusTagType(item.status)">{{ item.statusText || item.status }}</el-tag>
						<span class="text-sm">{{ item.stepText || '-' }}</span>
						<span class="text-xs c-gray">进度 {{ item.progressPercent ?? 0 }}% · 航点 {{ item.currentWaypointIndex ?? 0 }} · 媒体 {{ item.mediaCount ?? 0 }}</span>
					</div>
					<div v-if="item.breakPointJson" class="text-xs c-gray mt-1 break-all">{{ prettyJson(item.breakPointJson) }}</div>
				</el-timeline-item>
			</el-timeline>
		</el-drawer>
	</div>
</template>

<script setup lang="ts" name="djiWaylineTask">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import { pageDjiWayline } from '/@/api/main/djiWayline';
import {
	activeWaylineTaskByDock,
	createWaylineTask,
	detailWaylineTask,
	dockOptionsWaylineTask,
	executeWaylineTask,
	pageWaylineTask,
	pauseWaylineTask,
	progressWaylineTask,
	recoveryWaylineTask,
	statusOptionsWaylineTask,
	stopWaylineTask,
	undoWaylineTask,
} from '/@/api/main/djiWaylineTask';

const route = useRoute();

const loading = ref(false);
const tableData = ref<any[]>([]);
const queryParams = ref<any>({});
const tableParams = ref({ page: 1, pageSize: 10, total: 0 });

/** 状态/步骤字典由后端下发，避免前后端各维护一份映射导致显示不一致 */
const statusOptions = ref<{ value: string; label: string; isTerminal: boolean }[]>([]);
const docks = ref<any[]>([]);
const waylines = ref<any[]>([]);

/** 任务类型：与后端 TaskTypeCodeEnum 对应 */
const taskTypeOptions = [
	{ label: '立即任务', value: 0 },
	{ label: '定时任务', value: 1 },
	{ label: '条件任务', value: 2 },
];

/* ------------------------------ 列表查询 ------------------------------ */

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
	await Promise.all([loadStatusOptions(), loadDocks()]);
	// 从航线管理页「下发任务」跳转过来时带航线 Id，直接打开对话框
	const preset = Number(route.query.waylineEntityId ?? 0);
	await handleQuery();
	if (preset) await openDispatch(undefined, preset);
});

onUnmounted(stopPolling);

async function loadStatusOptions() {
	try {
		const res = await statusOptionsWaylineTask();
		statusOptions.value = res.data.result ?? [];
	} catch {
		// 字典加载失败不阻塞列表
	}
}

async function loadDocks(workspaceId?: string) {
	try {
		const res = await dockOptionsWaylineTask(workspaceId || queryParams.value.workspaceId);
		docks.value = res.data.result ?? [];
	} catch {
		docks.value = [];
	}
}

async function loadWaylines(workspaceId?: string) {
	try {
		const res = await pageDjiWayline({ page: 1, pageSize: 200, workspaceId });
		waylines.value = res.data.result?.items ?? [];
	} catch {
		waylines.value = [];
	}
}

async function handleQuery() {
	loading.value = true;
	try {
		const res = await pageWaylineTask(Object.assign(queryParams.value, tableParams.value));
		tableData.value = res.data.result?.items ?? [];
		tableParams.value.total = res.data.result?.total ?? 0;
		// 任务执行期间进度变化频繁，仅在列表中存在未结束任务时轮询，避免无谓请求
		syncPolling();
	} finally {
		loading.value = false;
	}
}

/** 有未结束任务则每 5 秒刷新一次，全部结束后自动停止 */
function syncPolling() {
	const hasActive = tableData.value.some((row) => row.isActive);
	if (hasActive && !timer) {
		timer = setInterval(refreshSilently, 5000);
	} else if (!hasActive) {
		stopPolling();
	}
}

async function refreshSilently() {
	try {
		const res = await pageWaylineTask(Object.assign({}, queryParams.value, tableParams.value));
		tableData.value = res.data.result?.items ?? [];
		tableParams.value.total = res.data.result?.total ?? 0;
		if (!tableData.value.some((row) => row.isActive)) stopPolling();
	} catch {
		stopPolling();
	}
}

function stopPolling() {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
}

function resetQuery() {
	queryParams.value = {};
	tableParams.value.page = 1;
	loadDocks();
	handleQuery();
}

/** 切换空间：机场下拉需跟着收敛到该空间，避免跨空间选错机场 */
function handleWorkspaceChange() {
	queryParams.value.dockSn = undefined;
	loadDocks(queryParams.value.workspaceId);
	tableParams.value.page = 1;
	handleQuery();
}

/* ------------------------------ 下发任务 ------------------------------ */

const dispatchVisible = ref(false);
const dispatching = ref(false);
const dispatchFormRef = ref<FormInstance>();
const dispatchForm = ref<any>({ taskType: 0, outOfControlAction: 0 });

const dispatchRules = {
	waylineEntityId: [{ required: true, message: '请选择要执行的航线', trigger: 'change' }],
	dockSn: [{ required: true, message: '请选择执行机场', trigger: 'change' }],
	executeTime: [
		{
			validator: (_rule: any, value: any, callback: (e?: Error) => void) => {
				if (dispatchForm.value.taskType === 0) return callback();
				if (!value) return callback(new Error('定时/条件任务必须选择执行时间'));
				callback();
			},
			trigger: 'change',
		},
	],
};

/** 打开下发对话框；传 presetWaylineId 用于「重发」或从航线管理页跳转 */
async function openDispatch(row?: any, presetWaylineId?: number) {
	await loadWaylines(queryParams.value.workspaceId);
	await loadDocks(queryParams.value.workspaceId);

	dispatchForm.value = {
		taskType: 0,
		outOfControlAction: 0,
		waylineEntityId: presetWaylineId ?? row?.waylineEntityId ?? undefined,
		dockSn: row?.dockSn ?? undefined,
		jobName: row?.jobName ?? undefined,
		rthAltitude: row?.rthAltitude ?? undefined,
		batteryCapacity: undefined,
		readyWindow: undefined,
		executeTime: undefined,
	};
	dispatchVisible.value = true;
}

function resetDispatchForm() {
	dispatchFormRef.value?.clearValidate();
}

/** 下发前再确认一次机场占用情况，避免列表数据过期导致机场侧直接报错 */
async function submitDispatch() {
	const form = dispatchForm.value;
	const valid = await dispatchFormRef.value?.validate().catch(() => false);
	if (!valid) return;

	dispatching.value = true;
	try {
		const active = await activeWaylineTaskByDock(form.dockSn);
		if (active.data.result) {
			ElMessage.warning(`该机场已有未结束任务（${active.data.result.statusText || active.data.result.status}），请先结束后再下发`);
			return;
		}

		const payload: any = {
			waylineEntityId: form.waylineEntityId,
			dockSn: form.dockSn,
			taskType: form.taskType,
			jobName: form.jobName || undefined,
			outOfControlAction: form.outOfControlAction,
		};
		if (form.rthAltitude) payload.rthAltitude = form.rthAltitude;
		if (form.taskType !== 0 && form.executeTime) payload.executeTime = form.executeTime;
		if (form.taskType === 2) {
			payload.readyConditions = {
				batteryCapacity: form.batteryCapacity ?? undefined,
				beginTime: form.readyWindow?.[0],
				endTime: form.readyWindow?.[1],
			};
		}

		await createWaylineTask(payload);
		ElMessage.success('任务已下发');
		dispatchVisible.value = false;
		tableParams.value.page = 1;
		handleQuery();
	} finally {
		dispatching.value = false;
	}
}

/* ------------------------------ 任务控制 ------------------------------ */

function canExecute(row: any) {
	return row.status === 'sent' || row.status === 'ready';
}

async function handleExecute(row: any) {
	await confirmAndRun(`确定立即执行任务「${row.jobName}」吗？`, () => executeWaylineTask(row.id), '执行指令已下发');
}

async function handlePause(row: any) {
	await confirmAndRun(`确定暂停任务「${row.jobName}」吗？`, () => pauseWaylineTask(row.id), '暂停指令已下发');
}

async function handleRecovery(row: any) {
	await confirmAndRun(`确定恢复任务「${row.jobName}」吗？`, () => recoveryWaylineTask(row.id), '恢复指令已下发');
}

async function handleMoreCommand(cmd: string, row: any) {
	if (cmd === 'undo') {
		await confirmAndRun(`确定取消任务「${row.jobName}」吗？飞行器将执行返航。`, () => undoWaylineTask(row.id), '取消指令已下发');
	} else if (cmd === 'stop') {
		await confirmAndRun(`确定结束任务「${row.jobName}」吗？机场将降落并退出工作模式。`, () => stopWaylineTask(row.id), '结束指令已下发');
	}
}

/** 统一「二次确认 → 调接口 → 提示 → 刷新」流程 */
async function confirmAndRun(message: string, action: () => Promise<any>, successText: string) {
	try {
		await ElMessageBox.confirm(message, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
	} catch {
		return;
	}
	await action();
	ElMessage.success(successText);
	handleQuery();
}

/* ------------------------------ 任务详情 ------------------------------ */

const detailVisible = ref(false);
const detail = ref<any>(null);
const detailProgress = ref<any[]>([]);

async function openDetail(row: any) {
	detailVisible.value = true;
	detail.value = null;
	detailProgress.value = [];
	const [detailRes, progressRes] = await Promise.all([detailWaylineTask(row.id), progressWaylineTask(row.id)]);
	detail.value = detailRes.data.result;
	detailProgress.value = (progressRes.data.result ?? []).slice().reverse();
}

/* ------------------------------ 展示辅助 ------------------------------ */

/** 状态 → Element Tag 类型（仅决定颜色，文案一律用后端的 statusText） */
function statusTagType(status?: string) {
	switch (status) {
		case 'ok':
			return 'success';
		case 'in_progress':
			return 'primary';
		case 'ready':
		case 'paused':
		case 'partially_done':
			return 'warning';
		case 'failed':
		case 'rejected':
		case 'timeout':
			return 'danger';
		default:
			return 'info';
	}
}

function progressStatus(status?: string) {
	if (status === 'ok') return 'success';
	if (status === 'failed' || status === 'rejected' || status === 'timeout') return 'exception';
	return undefined;
}

function taskTypeLabel(taskType?: number) {
	return taskTypeOptions.find((item) => item.value === taskType)?.label ?? '-';
}

function taskTypeTagType(taskType?: number) {
	return taskType === 0 ? 'success' : taskType === 1 ? 'warning' : 'info';
}

function outOfControlLabel(action?: number | null) {
	if (action === null || action === undefined) return '-';
	return ['返航', '悬停', '降落'][action] ?? '-';
}

function dockLabel(dock: any) {
	return `${dock.nick || dock.sn}（${dock.sn}）`;
}

function dockHint(dock: any) {
	if (!dock.isOnline) return '离线';
	if (dock.busy) return `占用中：${dock.busyStatus || '执行中'}`;
	return '可下发';
}

/** 毫秒时间戳格式化（协议中的 execute_time） */
function formatTimestamp(value?: number | null) {
	return value ? formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS') : '-';
}

function formatDateTime(value?: string | null) {
	return value ? formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS') : '-';
}

function prettyJson(value: string) {
	try {
		return JSON.stringify(JSON.parse(value), null, 2);
	} catch {
		return value;
	}
}
</script>
