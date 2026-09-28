<template>
	<div class="djiHms-container">
		<!-- 总览：活跃告警是唯一需要立刻处理的东西，因此把它放最前 -->
		<el-row :gutter="8" class="mb10">
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">活跃告警</div>
					<div class="text-2xl font-bold mt-1" :class="{ 'c-danger': stats.activeCount > 0 }">{{ stats.activeCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">其中警告级</div>
					<div class="text-2xl font-bold mt-1" :class="{ 'c-danger': stats.warningCount > 0 }">{{ stats.warningCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">提醒级</div>
					<div class="text-2xl font-bold mt-1">{{ stats.remindCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">通知级</div>
					<div class="text-2xl font-bold mt-1">{{ stats.noticeCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">受影响机场</div>
					<div class="text-2xl font-bold mt-1">{{ stats.dockCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">历史已恢复</div>
					<div class="text-2xl font-bold mt-1">{{ stats.recoveredCount }}</div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 按机场分布：点一行即按该机场筛选，省掉一次下拉操作 -->
		<el-card v-if="stats.byDock?.length" shadow="hover" class="mb10" :body-style="{ padding: '10px 16px' }">
			<div class="flex items-center flex-wrap">
				<span class="text-xs c-gray mr-2">告警分布：</span>
				<el-tag
					v-for="item in stats.byDock"
					:key="item.dockSn"
					class="mr-2 mb-1 cursor-pointer"
					:type="item.warningCount > 0 ? 'danger' : 'warning'"
					effect="plain"
					@click="filterByDock(item.dockSn)"
				>
					{{ item.dockNick || item.dockSn }} · 活跃 {{ item.activeCount }}<template v-if="item.warningCount > 0">（警告 {{ item.warningCount }}）</template>
				</el-tag>
			</div>
		</el-card>

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
								<el-option v-for="dock in docks" :key="dock.sn" :label="dockLabel(dock)" :value="dock.sn" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="3" class="mb10">
						<el-form-item label="等级">
							<el-select v-model="queryParams.level" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="3" class="mb10">
						<el-form-item label="模块">
							<el-select v-model="queryParams.module" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="3" class="mb10">
						<el-form-item label="状态">
							<el-select v-model="queryParams.status" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="3" class="mb10">
						<el-form-item label="告警码">
							<el-input v-model="queryParams.code" clearable placeholder="支持前缀，如 0x16" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="关键字">
							<el-input v-model="queryParams.keyword" clearable placeholder="告警文案" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="5">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="resetQuery"> 重置 </el-button>
							</el-button-group>
							<el-checkbox v-model="onlyActive" class="ml-4" @change="handleOnlyActiveChange"> 只看活跃 </el-checkbox>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<!-- 告警列表 -->
		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<div class="mb10">
				<el-button type="danger" icon="ele-Delete" :disabled="selection.length === 0" @click="handleBatchDelete">
					删除记录（{{ selection.length }}）
				</el-button>
				<span class="ml-4 text-xs c-gray">
					删除是物理删除，会一并清掉「已恢复」的历史记录；排查间歇性故障时这些历史往往比当下状态更有价值，请谨慎操作。
				</span>
			</div>

			<el-table :data="tableData" style="width: 100%" v-loading="loading" tooltip-effect="light" row-key="id" border @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="45" align="center" />
				<el-table-column label="等级" width="86" align="center">
					<template #default="scope">
						<el-tag :type="levelTagType(scope.row.level)" effect="dark" size="small">{{ scope.row.levelName }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="状态" width="88" align="center">
					<template #default="scope">
						<el-tag :type="scope.row.status === 1 ? 'danger' : 'info'" effect="plain" size="small">
							{{ scope.row.statusName }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="text" label="告警内容" min-width="260" show-overflow-tooltip>
					<template #default="scope">
						<div>{{ scope.row.text || '（暂无该告警码的文案，请补充 HMS 文案字典）' }}</div>
						<div class="text-xs c-gray">{{ scope.row.textEn }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="code" label="告警码" width="100" align="center">
					<template #default="scope"><span class="font-mono text-xs">{{ scope.row.code }}</span></template>
				</el-table-column>
				<el-table-column prop="moduleName" label="模块" width="90" align="center" />
				<el-table-column prop="dockSn" label="机场" width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn || '-' }}</template>
				</el-table-column>
				<el-table-column label="来源" width="110" align="center">
					<template #default="scope">
						<el-tag size="small" effect="plain" :type="isDrone(scope.row) ? 'primary' : 'info'">
							{{ isDrone(scope.row) ? '飞行器' : '机场' }}
						</el-tag>
						<div v-if="scope.row.inTheSky === 1" class="text-xs c-danger">空中</div>
					</template>
				</el-table-column>
				<el-table-column prop="durationText" label="持续" width="110" align="center" />
				<el-table-column prop="lastTime" label="最近上报" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.lastTime) }}</template>
				</el-table-column>
				<el-table-column label="操作" width="90" align="center" fixed="right">
					<template #default="scope">
						<el-button icon="ele-InfoFilled" size="small" text type="info" @click="openDetail(scope.row)">详情</el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-pagination
				v-model:currentPage="tableParams.page"
				v-model:page-size="tableParams.pageSize"
				:total="tableParams.total"
				:page-sizes="[20, 50, 100, 200]"
				small
				background
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleQuery"
				@current-change="handleQuery"
			/>
		</el-card>

		<!-- 详情 -->
		<el-drawer v-model="detailVisible" title="告警详情" size="45%">
			<el-descriptions v-if="detail" :column="2" border size="small">
				<el-descriptions-item label="告警内容" :span="2">{{ detail.text || '-' }}</el-descriptions-item>
				<el-descriptions-item label="英文文案" :span="2">{{ detail.textEn || '-' }}</el-descriptions-item>
				<el-descriptions-item label="告警码">
					<span class="font-mono">{{ detail.code }}</span>
				</el-descriptions-item>
				<el-descriptions-item label="等级">{{ detail.levelName }}</el-descriptions-item>
				<el-descriptions-item label="模块">{{ detail.moduleName }}</el-descriptions-item>
				<el-descriptions-item label="状态">{{ detail.statusName }}</el-descriptions-item>
				<el-descriptions-item label="机场">{{ detail.dockNick || detail.dockSn }}</el-descriptions-item>
				<el-descriptions-item label="来源设备">{{ detail.deviceSn || '-' }}</el-descriptions-item>
				<el-descriptions-item label="设备产品枚举" :span="2">
					<span class="font-mono text-xs">{{ detail.deviceType || '-' }}</span>
				</el-descriptions-item>
				<el-descriptions-item label="部件索引">{{ detail.componentIndex }}</el-descriptions-item>
				<el-descriptions-item label="传感器索引">{{ detail.sensorIndex }}</el-descriptions-item>
				<el-descriptions-item label="首次出现">{{ formatDateTime(detail.firstTime) || '-' }}</el-descriptions-item>
				<el-descriptions-item label="最近上报">{{ formatDateTime(detail.lastTime) || '-' }}</el-descriptions-item>
				<el-descriptions-item label="恢复时间">{{ formatDateTime(detail.recoverTime) || '-' }}</el-descriptions-item>
				<el-descriptions-item label="持续时长">{{ detail.durationText || '-' }}</el-descriptions-item>
				<el-descriptions-item label="是否在空中">{{ detail.inTheSky === 1 ? '是' : '否' }}</el-descriptions-item>
				<el-descriptions-item label="及时性告警">{{ detail.imminent === 1 ? '是（随条件改善自动消失）' : '否' }}</el-descriptions-item>
			</el-descriptions>
		</el-drawer>
	</div>
</template>

<script setup lang="ts" name="djiHms">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import {
	deleteDjiHms,
	dockOptionsDjiHms,
	detailDjiHms,
	levelOptionsDjiHms,
	moduleOptionsDjiHms,
	pageDjiHms,
	statsDjiHms,
	statusOptionsDjiHms,
} from '/@/api/main/djiHms';

/** 与后端 HmsLevelEnum 对应（0 通知 / 1 提醒 / 2 警告） */
const HmsLevel = { Notice: 0, Remind: 1, Warning: 2 };

const loading = ref(false);
const tableData = ref<any[]>([]);
const selection = ref<any[]>([]);
const queryParams = ref<any>({});
const tableParams = ref({ page: 1, pageSize: 20, total: 0 });

/**
 * 默认只看活跃告警。
 *
 * 告警中心的第一诉求是「现在有什么要我处理」，历史已恢复记录只在排查间歇性故障时才有用，
 * 因此默认收窄；需要时取消勾选即可查全量。
 */
const onlyActive = ref(true);

const levelOptions = ref<{ value: number; label: string }[]>([]);
const moduleOptions = ref<{ value: number; label: string }[]>([]);
const statusOptions = ref<{ value: number; label: string }[]>([]);
const docks = ref<any[]>([]);

const stats = ref({
	total: 0,
	activeCount: 0,
	recoveredCount: 0,
	warningCount: 0,
	remindCount: 0,
	noticeCount: 0,
	dockCount: 0,
	byDock: [] as any[],
});

const detailVisible = ref(false);
const detail = ref<any>(null);

onMounted(async () => {
	await Promise.all([loadLevelOptions(), loadModuleOptions(), loadStatusOptions(), loadDocks()]);
	await handleQuery();
});

/* ------------------------------ 字典与下拉 ------------------------------ */

async function loadLevelOptions() {
	try {
		const res = await levelOptionsDjiHms();
		levelOptions.value = res.data.result ?? [];
	} catch {
		levelOptions.value = [];
	}
}

async function loadModuleOptions() {
	try {
		const res = await moduleOptionsDjiHms();
		moduleOptions.value = res.data.result ?? [];
	} catch {
		moduleOptions.value = [];
	}
}

async function loadStatusOptions() {
	try {
		const res = await statusOptionsDjiHms();
		statusOptions.value = res.data.result ?? [];
	} catch {
		statusOptions.value = [];
	}
}

async function loadDocks(workspaceId?: string) {
	try {
		const res = await dockOptionsDjiHms(workspaceId || queryParams.value.workspaceId);
		docks.value = res.data.result ?? [];
	} catch {
		docks.value = [];
	}
}

function dockLabel(dock: any) {
	return dock.activeCount > 0 ? `${dock.label} · 活跃 ${dock.activeCount}` : dock.label;
}

/* ------------------------------ 查询 ------------------------------ */

function handleOnlyActiveChange() {
	tableParams.value.page = 1;
	handleQuery();
}

/** 点击分布标签即按该机场筛选 */
function filterByDock(dockSn: string) {
	queryParams.value.dockSn = dockSn;
	tableParams.value.page = 1;
	handleQuery();
}

async function handleQuery() {
	loading.value = true;
	try {
		const res = await pageDjiHms(
			Object.assign({}, queryParams.value, tableParams.value, { onlyActive: onlyActive.value || undefined })
		);
		tableData.value = res.data.result?.items ?? [];
		tableParams.value.total = res.data.result?.total ?? 0;
		await loadStats();
	} finally {
		loading.value = false;
	}
}

/**
 * 统计只按空间 + 机场收窄，不带等级 / 关键字等筛选条件。
 *
 * 这是刻意的：概览卡片回答的是「整体情况如何」，若跟着列表筛选一起变，
 * 用户筛到某个等级后卡片数字会一起变成「已筛选后的数量」，失去参照意义。
 */
async function loadStats() {
	try {
		const res = await statsDjiHms({
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
	onlyActive.value = true;
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

/* ------------------------------ 展示辅助 ------------------------------ */

function formatDateTime(value?: string) {
	if (!value) return '';
	return formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS');
}

function levelTagType(level: number) {
	if (level === HmsLevel.Warning) return 'danger';
	if (level === HmsLevel.Remind) return 'warning';
	return 'info';
}

/**
 * 判断告警来源是飞行器还是机场。
 *
 * HMS 报文不直接给设备 SN，只能看 deviceType 的首段（domain）：3 = 机场，0 = 飞行器。
 * 与后端 DjiHmsRepository.ResolveDeviceSn 的判定口径保持一致。
 */
function isDrone(row: any) {
	const domain = String(row?.deviceType ?? '').split('-')[0];
	return domain !== '3';
}

/* ------------------------------ 详情 ------------------------------ */

async function openDetail(row: any) {
	try {
		const res = await detailDjiHms(row.id);
		detail.value = res.data.result ?? row;
		detailVisible.value = true;
	} catch {
		ElMessage.error('获取告警详情失败');
	}
}

/* ------------------------------ 删除 ------------------------------ */

function handleSelectionChange(rows: any[]) {
	selection.value = rows ?? [];
}

async function handleBatchDelete() {
	if (selection.value.length === 0) return;
	await ElMessageBox.confirm(
		`确定要删除选中的 ${selection.value.length} 条告警记录吗？此操作不可恢复，已恢复的历史记录也会一并清除。`,
		'删除确认',
		{ type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
	);
	try {
		await deleteDjiHms(selection.value.map((m) => m.id));
		ElMessage.success('删除成功');
		selection.value = [];
		await handleQuery();
	} catch {
		// 请求拦截器已提示错误
	}
}
</script>

<!-- c-danger / c-gray 等颜色类由 uno.config.ts 的 shortcuts 统一提供，无需本页面再写 scoped 样式 -->
