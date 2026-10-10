<template>
	<div class="djiAirSense-container">
		<!-- 统计 -->
		<el-row :gutter="8" class="mb10">
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" style="height: 100%" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">告警记录总数</div>
					<div class="text-2xl font-bold mt-1">{{ stats.total }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" style="height: 100%" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">需避让（≥3 级）</div>
					<div class="text-2xl font-bold mt-1" :class="{ 'c-danger': stats.alertCount > 0 }">{{ stats.alertCount }}</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" style="height: 100%" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">涉及目标数</div>
					<div class="text-2xl font-bold mt-1">{{ stats.targetCount }}</div>
					<div class="text-xs c-gray">按 ICAO 地址去重</div>
				</el-card>
			</el-col>
			<el-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
				<el-card shadow="hover" style="height: 100%" :body-style="{ padding: '12px 16px' }">
					<div class="text-xs c-gray">最近一次告警</div>
					<div class="mt-1 font-bold" style="font-size: 15px">{{ formatDateTime(stats.lastTime) }}</div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 等级分布：点一下即按该等级筛选 -->
		<el-card v-if="stats.byLevel?.length" shadow="hover" class="mb10" :body-style="{ padding: '10px 16px' }">
			<div class="flex items-center flex-wrap">
				<span class="text-xs c-gray mr-2">等级分布：</span>
				<el-tag v-for="item in stats.byLevel" :key="item.level" class="mr-2 mb-1 cursor-pointer" :type="levelTagType(item.level)" effect="plain" @click="filterByLevel(item.level)">
					{{ item.levelName }} · {{ item.count }}
				</el-tag>
			</div>
		</el-card>

		<!-- 查询条件 -->
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-form :model="queryParams" label-width="90">
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
						<el-form-item label="告警等级">
							<el-select v-model="queryParams.warningLevel" clearable placeholder="全部" @change="handleQuery">
								<el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="ICAO">
							<el-input v-model="queryParams.keyword" clearable placeholder="模糊匹配" @keyup.enter="handleQuery" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="4" class="mb10">
						<el-form-item label="水平距离">
							<el-input-number v-model="queryParams.maxDistance" :min="0" :step="1000" controls-position="right" placeholder="米以内" style="width: 100%" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="8" class="mb10">
						<el-form-item label="上报时间">
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
					<el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
						<el-form-item>
							<el-button-group>
								<el-button type="primary" icon="ele-Search" @click="handleQuery"> 查询 </el-button>
								<el-button icon="ele-Refresh" @click="resetQuery"> 重置 </el-button>
							</el-button-group>
							<el-checkbox v-model="onlyAlert" class="ml-4" @change="handleOnlyAlertChange"> 只看需避让 </el-checkbox>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<div class="mb10">
				<el-button type="danger" icon="ele-Delete" :disabled="selection.length === 0" @click="handleBatchDelete"> 删除记录（{{ selection.length }}） </el-button>
				<span class="ml-4 text-xs c-gray"> 这是<b>流水表</b>：设备每推一次报文就展开成多行，事后无法从任何快照反推 —— 删除前请确认已导出留档。 </span>
			</div>

			<el-table :data="tableData" style="width: 100%" v-loading="loading" size="small" border row-key="id" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="45" align="center" />
				<el-table-column label="等级" width="90" align="center">
					<template #default="scope">
						<el-tag :type="levelTagType(scope.row.warningLevel)" effect="dark" size="small">{{ scope.row.warningLevelName }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="ICAO" width="130">
					<template #default="scope"
						><span class="font-mono text-xs">{{ scope.row.icao || '-' }}</span></template
					>
				</el-table-column>
				<el-table-column label="水平距离" width="110" align="right">
					<template #default="scope">
						<span :class="{ 'c-danger': scope.row.isAlert }">{{ formatDistance(scope.row.distance) }}</span>
					</template>
				</el-table-column>
				<el-table-column label="相对高度" width="130" align="right">
					<template #default="scope">
						<div>{{ formatAltitude(scope.row.relativeAltitude) }}</div>
						<div class="text-xs c-gray">{{ scope.row.vertTrendName }}</div>
					</template>
				</el-table-column>
				<el-table-column label="目标高度" width="120" align="right">
					<template #default="scope">
						<div>{{ formatAltitude(scope.row.altitude) }}</div>
						<div class="text-xs c-gray">{{ scope.row.altitudeTypeName }}</div>
					</template>
				</el-table-column>
				<el-table-column label="航向" width="90" align="right">
					<template #default="scope">{{ formatHeading(scope.row.heading) }}</template>
				</el-table-column>
				<el-table-column label="方位" width="90" align="center">
					<template #default="scope">
						<span class="text-xs">{{ bearingName(scope.row) }}</span>
					</template>
				</el-table-column>
				<el-table-column label="机场" width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn || '-' }}</template>
				</el-table-column>
				<el-table-column prop="createTime" label="落库时间" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.createTime) }}</template>
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
				:page-sizes="[20, 50, 100]"
				small
				background
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleQuery"
				@current-change="handleQuery"
			/>
		</el-card>

		<!-- 详情：含方位罗盘 -->
		<el-drawer v-model="detailVisible" title="AirSense 告警详情" size="45%">
			<el-row :gutter="16" v-if="detail">
				<el-col :span="10">
					<div class="text-xs c-gray mb-1">目标相对方位</div>
					<!-- 以机场为原点，按「目标方位角 + 距离」画出相对位置 -->
					<svg :width="180" :height="180" viewBox="0 0 180 180">
						<circle :cx="90" :cy="90" r="78" fill="none" stroke="var(--el-border-color-light)" stroke-width="1" />
						<circle :cx="90" :cy="90" r="52" fill="none" stroke="var(--el-border-color-light)" stroke-width="1" stroke-dasharray="3 3" />
						<circle :cx="90" :cy="90" r="26" fill="none" stroke="var(--el-border-color-light)" stroke-width="1" stroke-dasharray="3 3" />
						<line x1="90" y1="12" x2="90" y2="168" stroke="var(--el-border-color-light)" stroke-width="1" />
						<line x1="12" y1="90" x2="168" y2="90" stroke="var(--el-border-color-light)" stroke-width="1" />
						<text x="90" y="10" text-anchor="middle" font-size="11" fill="var(--el-text-color-secondary)">北</text>
						<text x="174" y="94" text-anchor="end" font-size="11" fill="var(--el-text-color-secondary)">东</text>
						<text x="90" y="179" text-anchor="middle" font-size="11" fill="var(--el-text-color-secondary)">南</text>
						<text x="6" y="94" font-size="11" fill="var(--el-text-color-secondary)">西</text>

						<!-- 机场 -->
						<circle :cx="90" :cy="90" r="4" fill="var(--el-color-info)" />
						<text x="98" y="86" font-size="10" fill="var(--el-text-color-secondary)">机场</text>

						<!-- 目标 -->
						<template v-if="detailBearing != null">
							<line :x1="90" :y1="90" :x2="targetX" :y2="targetY" stroke="var(--el-color-danger)" stroke-width="1.5" stroke-dasharray="4 3" />
							<circle :cx="targetX" :cy="targetY" r="5" :fill="detail.isAlert ? 'var(--el-color-danger)' : 'var(--el-color-warning)'" />
							<text :x="targetX" :y="targetY - 9" text-anchor="middle" font-size="10" fill="var(--el-text-color-primary)">
								{{ detail.icao || '目标' }}
							</text>
						</template>
						<text v-else x="90" y="95" text-anchor="middle" font-size="10" fill="var(--el-text-color-secondary)">缺少坐标</text>
					</svg>
				</el-col>
				<el-col :span="14">
					<el-descriptions :column="1" border size="small">
						<el-descriptions-item label="ICAO 地址">
							<span class="font-mono">{{ detail.icao || '-' }}</span>
						</el-descriptions-item>
						<el-descriptions-item label="告警等级">
							<el-tag :type="levelTagType(detail.warningLevel)" effect="dark" size="small">{{ detail.warningLevelName }}</el-tag>
							<el-tag v-if="detail.isAlert" type="danger" size="small" class="ml-1">建议避让</el-tag>
						</el-descriptions-item>
						<el-descriptions-item label="水平距离">{{ formatDistance(detail.distance) }}</el-descriptions-item>
						<el-descriptions-item label="相对高度">{{ formatAltitude(detail.relativeAltitude) }}（{{ detail.vertTrendName }}）</el-descriptions-item>
						<el-descriptions-item label="目标高度">{{ formatAltitude(detail.altitude) }}（{{ detail.altitudeTypeName }}）</el-descriptions-item>
						<el-descriptions-item label="目标航向">{{ formatHeading(detail.heading) }}</el-descriptions-item>
						<el-descriptions-item label="相对方位">
							{{ detailBearing != null ? `${Math.round(detailBearing)}° ${bearingName(detail)}` : '缺少坐标，无法计算' }}
						</el-descriptions-item>
						<el-descriptions-item label="目标坐标">
							<span class="font-mono text-xs">{{ formatCoord(detail.longitude, detail.latitude) }}</span>
						</el-descriptions-item>
						<el-descriptions-item label="机场">
							{{ detail.dockNick || detail.dockSn }}
							<span class="font-mono text-xs c-gray"> {{ formatCoord(detail.dockLongitude, detail.dockLatitude) }}</span>
						</el-descriptions-item>
						<el-descriptions-item label="落库时间">{{ formatDateTime(detail.createTime) }}</el-descriptions-item>
					</el-descriptions>
				</el-col>
			</el-row>
		</el-drawer>
	</div>
</template>

<script setup lang="ts" name="djiAirSense">
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { deleteDjiAirSense, dockOptionsDjiAirSense, levelOptionsDjiAirSense, pageDjiAirSense, statsDjiAirSense } from '/@/api/main/djiAirSense';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';

const loading = ref(false);
const tableData = ref<any[]>([]);
const selection = ref<any[]>([]);
const queryParams = ref<any>({});
const tableParams = ref({ page: 1, pageSize: 20, total: 0 });
const dateRange = ref<any>(null);
const defaultTime = ref<[Date, Date]>([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]);
const onlyAlert = ref(false);

const docks = ref<any[]>([]);
const levelOptions = ref<{ value: number; label: string }[]>([]);

const stats = ref<any>({ total: 0, alertCount: 0, targetCount: 0, byLevel: [], lastTime: null });

const detailVisible = ref(false);
const detail = ref<any>(null);

onMounted(async () => {
	await Promise.all([loadDocks(), loadLevelOptions()]);
	await handleQuery();
});

/* ------------------------------ 字典与下拉 ------------------------------ */

async function loadDocks(workspaceId?: string) {
	try {
		const res = await dockOptionsDjiAirSense(workspaceId || queryParams.value.workspaceId);
		docks.value = res.data.result ?? [];
	} catch {
		docks.value = [];
	}
}

async function loadLevelOptions() {
	try {
		const res = await levelOptionsDjiAirSense();
		levelOptions.value = res.data.result ?? [];
	} catch {
		levelOptions.value = [];
	}
}

/* ------------------------------ 查询 ------------------------------ */

function handleOnlyAlertChange() {
	tableParams.value.page = 1;
	handleQuery();
}

function filterByLevel(level: number) {
	queryParams.value.warningLevel = level;
	tableParams.value.page = 1;
	handleQuery();
}

async function handleQuery() {
	loading.value = true;
	try {
		const res = await pageDjiAirSense(
			Object.assign({}, queryParams.value, tableParams.value, {
				onlyAlert: onlyAlert.value || undefined,
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

/** 统计只按空间 + 机场收窄，保证卡片是「整体情况」的参照 */
async function loadStats() {
	try {
		const res = await statsDjiAirSense({ workspaceId: queryParams.value.workspaceId, dockSn: queryParams.value.dockSn });
		stats.value = res.data.result ?? stats.value;
	} catch {
		// 统计失败不阻塞列表
	}
}

function resetQuery() {
	queryParams.value = {};
	dateRange.value = null;
	onlyAlert.value = false;
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

/* ------------------------------ 详情 ------------------------------ */

function openDetail(row: any) {
	detail.value = row;
	detailVisible.value = true;
}

/**
 * 机场 → 目标 的正方位角（0° = 正北，顺时针）。
 *
 * 报文里并没有「目标在哪个方位」这个字段，但有机场坐标与目标坐标，
 * 用球面方位公式算出来即可。比起引入地图组件，这种轻量罗盘
 * 对「要不要立即让飞」的判断更直接。
 */
function bearing(row: any): number | null {
	const lat1 = row?.dockLatitude;
	const lon1 = row?.dockLongitude;
	const lat2 = row?.latitude;
	const lon2 = row?.longitude;
	if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

	const toRad = Math.PI / 180;
	const φ1 = lat1 * toRad;
	const φ2 = lat2 * toRad;
	const Δλ = (lon2 - lon1) * toRad;

	const y = Math.sin(Δλ) * Math.cos(φ2);
	const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
	const deg = (Math.atan2(y, x) / toRad + 360) % 360;
	return deg;
}

const detailBearing = computed(() => (detail.value ? bearing(detail.value) : null));

/**
 * 罗盘上目标点的位置。
 *
 * 半径用「对数」压缩：真实距离从几百米到几十公里跨了三个数量级，
 * 线性映射会让近目标全挤在圆心、失去可读性。
 */
const CompassMaxMeters = 50000;

function compassRadius(distance?: number) {
	if (distance == null) return 60;
	const clamped = Math.max(100, Math.min(distance, CompassMaxMeters));
	const ratio = Math.log10(clamped / 100) / Math.log10(CompassMaxMeters / 100);
	return 20 + ratio * 58;
}

const targetX = computed(() => {
	if (detailBearing.value == null) return 90;
	const rad = ((detailBearing.value - 90) * Math.PI) / 180;
	return 90 + Math.cos(rad) * compassRadius(detail.value?.distance);
});

const targetY = computed(() => {
	if (detailBearing.value == null) return 90;
	const rad = ((detailBearing.value - 90) * Math.PI) / 180;
	return 90 + Math.sin(rad) * compassRadius(detail.value?.distance);
});

/* ------------------------------ 删除 ------------------------------ */

async function handleBatchDelete() {
	if (selection.value.length === 0) return;
	await ElMessageBox.confirm(`确定要删除选中的 ${selection.value.length} 条 AirSense 记录吗？这些是安全事件证据，删除后无法恢复。`, '删除确认', {
		type: 'warning',
		confirmButtonText: '确定删除',
		cancelButtonText: '取消',
	});
	try {
		await deleteDjiAirSense(selection.value.map((m) => m.id));
		ElMessage.success('删除成功');
		selection.value = [];
		await handleQuery();
	} catch {
		// 请求拦截器已提示错误
	}
}

/* ------------------------------ 展示辅助 ------------------------------ */

function formatDateTime(value?: string) {
	if (!value) return '';
	return formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS');
}

function formatCoord(lng?: number, lat?: number) {
	if (lng == null || lat == null) return '-';
	return `${lng.toFixed(5)}, ${lat.toFixed(5)}`;
}

function formatDistance(meters?: number) {
	if (meters == null) return '-';
	return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${meters} m`;
}

function formatAltitude(meters?: number) {
	if (meters == null) return '-';
	// 相对高度是本程序最关心的量：民航客机高度差可能在±几百米，带符号比绝对值有用
	return `${meters > 0 ? '+' : ''}${meters} m`;
}

function formatHeading(deg?: number) {
	if (deg == null) return '-';
	return `${Math.round(deg)}°`;
}

function bearingName(row: any) {
	const deg = bearing(row);
	if (deg == null) return '-';
	const names = ['正北', '东北', '正东', '东南', '正南', '西南', '正西', '西北'];
	return names[Math.round(deg / 45) % 8];
}

/**
 * 等级配色。
 *
 * 「≥3 级建议避让」这个阈值由后端统一定义并随 `isAlert` 下发，
 * 这里只对 <3 的等级做配色区分，不再重复判断阈值。
 */
function levelTagType(level: number) {
	if (level >= 4) return 'danger';
	if (level === 3) return 'danger';
	if (level === 2) return 'warning';
	if (level === 1) return 'info';
	return 'info';
}
</script>
