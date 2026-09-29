<template>
	<div class="djiLive-container">
		<!-- 服务状态与机场选择 -->
		<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
			<el-alert v-if="dockState && !dockState.liveEnabled && dockState.disabledReason" type="warning" :closable="false" show-icon class="mb10">
				<template #title>直播服务未就绪</template>
				{{ dockState.disabledReason }}
				<div class="text-xs mt-1">
					需在服务端 <span class="font-mono">Dji.json</span> 的 <span class="font-mono">Dji:Live</span> 段配置
					<span class="font-mono">RtmpPushBaseUrl</span> 与 <span class="font-mono">FlvPlayBaseUrl</span> 后重启服务。
				</div>
			</el-alert>

			<el-form label-width="80">
				<el-row>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="5" class="mb10">
						<el-form-item label="空间">
							<workspaceSelect v-model:id="workspaceId" @update:id="handleWorkspaceChange"></workspaceSelect>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="5" class="mb10">
						<el-form-item label="机场">
							<el-select v-model="dockSn" filterable clearable placeholder="请选择机场" @change="loadDockState">
								<el-option v-for="dock in docks" :key="dock.sn" :label="dockOptionLabel(dock)" :value="dock.sn" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="8" class="mb10">
						<el-form-item>
							<el-button icon="ele-Refresh" :loading="stateLoading" :disabled="!dockSn" @click="loadDockState()"> 刷新状态 </el-button>
							<span v-if="dockState" class="ml-4 text-xs c-gray">
								快照时间 {{ formatDateTime(dockState.updateTime) || '未知' }}
								· 并发上限 {{ dockState.coexistVideoNumberMax }}
								· 待上传媒体 {{ dockState.remainUpload }}
							</span>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<el-row :gutter="8" style="margin-top: 8px">
			<!-- 通道列表 -->
			<el-col :xs="24" :sm="24" :md="10" :lg="9" :xl="8">
				<el-card shadow="hover" class="full-table">
					<template #header>
						<div class="flex justify-between items-center">
							<span>可直播通道</span>
							<el-tag v-if="dockState" size="small" :type="dockState.liveCount > 0 ? 'success' : 'info'">
								在播 {{ dockState.liveCount }} / {{ dockState.coexistVideoNumberMax }}
							</el-tag>
						</div>
					</template>

					<el-empty v-if="!dockSn" description="请先选择机场" />
					<el-empty v-else-if="stateLoading && !dockState" description="加载中…" />
					<el-empty
						v-else-if="dockState && !dockState.hasCapacity"
						description="机场尚未上报直播能力（能力数据在设备状态变化时推送，请确认机场在线并已连接本平台）"
					/>

					<div v-else class="channel-list">
						<div
							v-for="channel in dockState?.channels ?? []"
							:key="channel.videoId"
							class="channel-item"
							:class="{ active: channel.videoId === activeVideoId }"
							@click="selectChannel(channel)"
						>
							<div class="flex justify-between items-center">
								<span class="font-medium">{{ channel.channelName || channel.videoIndex }}</span>
								<el-tag size="small" :type="channel.isLive ? 'success' : 'info'" effect="plain">
									{{ channel.isLive ? '在播' : '空闲' }}
								</el-tag>
							</div>
							<div class="text-xs c-gray mt-1 break-all font-mono">{{ channel.videoId }}</div>
							<div class="text-xs mt-1">
								<span class="c-gray">镜头：{{ lensLabel(channel.videoType) }}</span>
								<span v-if="channel.videoQuality" class="c-gray ml-2">清晰度：{{ qualityLabel(channel.videoQuality) }}</span>
								<span v-if="channel.errorStatus" class="c-danger ml-2">错误码 {{ channel.errorStatus }}</span>
							</div>
							<div class="mt-2">
								<el-button v-if="!channel.isLive" type="primary" size="small" icon="ele-VideoPlay" :disabled="!canStart" @click.stop="openStartDialog(channel)">
									开播
								</el-button>
								<template v-else>
									<el-button type="danger" size="small" icon="ele-SwitchButton" @click.stop="handleStop(channel)"> 停播 </el-button>
									<el-button type="primary" size="small" text icon="ele-View" @click.stop="previewChannel(channel)"> 观看 </el-button>
								</template>
							</div>
						</div>
					</div>
				</el-card>
			</el-col>

			<!-- 播放器与控制 -->
			<el-col :xs="24" :sm="24" :md="14" :lg="15" :xl="16">
				<el-card shadow="hover" class="full-table">
					<template #header>
						<div class="flex justify-between items-center">
							<span>直播画面</span>
							<div v-if="activeSession">
								<el-tag size="small" :type="statusTagType(activeSession.status)">{{ activeSession.statusName }}</el-tag>
								<span class="ml-2 text-xs c-gray">{{ activeSession.dockNick || activeSession.dockSn }}</span>
							</div>
						</div>
					</template>

					<div class="player-box">
						<video
							v-if="activeSession"
							ref="videoRef"
							controls
							autoplay
							muted
							playsinline
							class="player-video"
						></video>
						<el-empty v-else description="选择一路「在播」的通道，或直接开播" />
					</div>

					<div v-if="playerError" class="mt-2">
						<el-alert type="error" :closable="false" show-icon :title="playerError" />
					</div>

					<!-- 播放中：控制面板 -->
					<template v-if="activeSession">
						<el-divider content-position="left">直播控制</el-divider>
						<el-form label-width="90" size="small">
							<el-row>
								<el-col :xs="24" :sm="12" :md="12" :lg="8">
									<el-form-item label="清晰度">
										<el-select v-model="controlQuality" style="width: 100%" @change="handleQualityChange">
											<el-option v-for="item in qualityOptions" :key="item.value" :label="item.label" :value="item.value" />
										</el-select>
									</el-form-item>
								</el-col>
								<el-col :xs="24" :sm="12" :md="12" :lg="8">
									<el-form-item label="镜头">
										<el-select v-model="controlLens" style="width: 100%" :disabled="switchableLens.length === 0" @change="handleLensChange">
											<el-option v-for="item in switchableLens" :key="item.value" :label="item.label" :value="item.value" />
										</el-select>
									</el-form-item>
								</el-col>
								<el-col :xs="24" :sm="12" :md="12" :lg="8">
									<el-form-item label="FPV 位置">
										<el-radio-group v-model="controlCamera" :disabled="!isFpv" @change="handleCameraChange">
											<el-radio-button :value="0">舱内</el-radio-button>
											<el-radio-button :value="1">舱外</el-radio-button>
										</el-radio-group>
									</el-form-item>
								</el-col>
							</el-row>
						</el-form>

						<el-descriptions :column="2" border size="small">
							<el-descriptions-item label="码流">{{ activeSession.videoId }}</el-descriptions-item>
							<el-descriptions-item label="流名">
								<span class="font-mono text-xs">{{ activeSession.streamName }}</span>
							</el-descriptions-item>
							<el-descriptions-item label="播放地址" :span="2">
								<span class="font-mono text-xs break-all">{{ activeSession.playUrl || activeSession.hlsUrl || '-' }}</span>
							</el-descriptions-item>
							<el-descriptions-item label="推流地址" :span="2">
								<span class="font-mono text-xs break-all">{{ activeSession.pushUrl }}</span>
							</el-descriptions-item>
							<el-descriptions-item label="开播时间">{{ formatDateTime(activeSession.startTime) }}</el-descriptions-item>
							<el-descriptions-item label="操作人">{{ activeSession.operatorName || '-' }}</el-descriptions-item>
						</el-descriptions>

						<div class="mt-2">
							<el-button type="danger" icon="ele-SwitchButton" :loading="controlling" @click="handleStopSession"> 停止直播 </el-button>
							<el-button icon="ele-Refresh" @click="restartPlayer"> 重连播放器 </el-button>
							<span class="ml-4 text-xs c-gray">浏览器默认静音自动播放；如需声音请点播放器音量按钮。</span>
						</div>
					</template>
				</el-card>
			</el-col>
		</el-row>

		<!-- 历史会话 -->
		<el-card class="full-table" shadow="hover" style="margin-top: 8px">
			<template #header>
				<div class="flex justify-between items-center">
					<span>直播记录</span>
					<div>
						<el-select v-model="sessionQuery.status" clearable placeholder="全部状态" size="small" style="width: 120px" @change="handleSessionQuery">
							<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
						<el-select v-model="sessionQuery.dockSn" clearable placeholder="全部机场" size="small" style="width: 180px; margin-left: 8px" @change="handleSessionQuery">
							<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
						</el-select>
						<el-checkbox v-model="sessionQuery.onlyActive" class="ml-4" @change="handleSessionQuery"> 只看进行中 </el-checkbox>
						<el-button icon="ele-Refresh" size="small" type="primary" style="margin-left: 8px" @click="handleSessionQuery"> 刷新 </el-button>
					</div>
				</div>
			</template>

			<el-table :data="sessionData" style="width: 100%" v-loading="sessionLoading" border>
				<el-table-column type="index" label="序号" width="55" align="center" />
				<el-table-column prop="dockSn" label="机场" width="150" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn }}</template>
				</el-table-column>
				<el-table-column prop="videoId" label="码流" min-width="200" show-overflow-tooltip>
					<template #default="scope"><span class="font-mono text-xs">{{ scope.row.videoId }}</span></template>
				</el-table-column>
				<el-table-column prop="videoTypeName" label="镜头" width="90" align="center" />
				<el-table-column prop="videoQualityName" label="清晰度" width="90" align="center" />
				<el-table-column prop="urlTypeName" label="协议" width="90" align="center" />
				<el-table-column prop="status" label="状态" width="95" align="center">
					<template #default="scope">
						<el-tag :type="statusTagType(scope.row.status)">{{ scope.row.statusName || scope.row.status }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="startTime" label="开播时间" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.startTime) }}</template>
				</el-table-column>
				<el-table-column prop="stopTime" label="停播时间" width="160">
					<template #default="scope">{{ formatDateTime(scope.row.stopTime) || '-' }}</template>
				</el-table-column>
				<el-table-column prop="operatorName" label="操作人" width="110" show-overflow-tooltip>
					<template #default="scope">{{ scope.row.operatorName || '-' }}</template>
				</el-table-column>
				<el-table-column prop="errorMessage" label="失败原因" min-width="160" show-overflow-tooltip>
					<template #default="scope">
						<span v-if="scope.row.errorMessage" class="c-danger">{{ scope.row.errorMessage }}</span>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="120" align="center" fixed="right">
					<template #default="scope">
						<el-button v-if="isActiveStatus(scope.row.status)" type="danger" size="small" text icon="ele-SwitchButton" @click="handleStop(scope.row, true)">
							停播
						</el-button>
						<el-button v-else type="primary" size="small" text icon="ele-View" @click="previewChannel(scope.row)"> 查看 </el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-pagination
				v-model:current-page="sessionParams.page"
				v-model:page-size="sessionParams.pageSize"
				:total="sessionParams.total"
				:page-sizes="[10, 20, 50, 100]"
				small
				background
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="loadSessions"
				@current-change="loadSessions"
			/>
		</el-card>

		<!-- 开播对话框 -->
		<el-dialog v-model="startVisible" title="开始直播" width="520px" :close-on-click-modal="false">
			<el-form label-width="90">
				<el-form-item label="机场">
					<span>{{ dockState?.dockNick || dockState?.dockSn }}</span>
					<el-tag v-if="dockState && !dockState.isOnline" type="danger" size="small" class="ml-2">机场离线</el-tag>
				</el-form-item>
				<el-form-item label="通道">
					<div>
						<div>{{ startChannel?.channelName || startChannel?.videoIndex }}</div>
						<div class="font-mono text-xs c-gray break-all">{{ startChannel?.videoId }}</div>
					</div>
				</el-form-item>
				<el-form-item label="清晰度">
					<el-select v-model="startQuality" style="width: 100%">
						<el-option v-for="item in qualityOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
					<div class="text-xs c-gray leading-4 mt-1">码流实际可用的分辨率受相机与当前负载状态限制，机场可能降级到最接近的档位。</div>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="startVisible = false">取消</el-button>
				<el-button type="primary" :loading="starting" @click="submitStart">确定开播</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="djiLive">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import {
	cameraChangeDjiLive,
	detailDjiLive,
	dockOptionsDjiLive,
	dockStateDjiLive,
	lensChangeDjiLive,
	pageDjiLive,
	setQualityDjiLive,
	startDjiLive,
	statusOptionsDjiLive,
	stopDjiLive,
	qualityOptionsDjiLive,
	lensOptionsDjiLive,
} from '/@/api/main/djiLive';

/**
 * 用 flv.js 播 HTTP-FLV（低延迟首选），不可用时回退 hls.js。
 *
 * 之所以两者都预装：SRS 同时开了 FLV 与 HLS 出口，但浏览器对 FLV 的支持
 * 依赖 MSE（iOS Safari 不支持 MSE 做 FLV），此时只能退到 HLS，
 * 代价是延迟从约 1s 升到 5–10s。页面会明确提示当前用的哪条链路。
 */
import flvjs from 'flv.js';
import Hls from 'hls.js';

/** 会话状态：与后端 LiveStreamStatusEnum 对应 */
const LiveStatus = { Starting: 0, Live: 1, Stopped: 2, Failed: 3 };

const workspaceId = ref<string>();
const dockSn = ref<string>();
const dockState = ref<any>(null);
const stateLoading = ref(false);

const docks = ref<any[]>([]);
const qualityOptions = ref<{ value: number; label: string }[]>([]);
const lensOptions = ref<{ value: string; label: string }[]>([]);
const statusOptions = ref<{ value: number; label: string }[]>([]);

const activeSession = ref<any>(null);
const activeVideoId = ref<string>('');

const controlQuality = ref<number>(0);
const controlLens = ref<string>('');
const controlCamera = ref<number>(0);
const controlling = ref(false);

const startVisible = ref(false);
const starting = ref(false);
const startChannel = ref<any>(null);
const startQuality = ref<number>(0);

const playerError = ref('');
const videoRef = ref<HTMLVideoElement | null>(null);
let flvPlayer: any = null;
let hlsPlayer: any = null;
let stateTimer: ReturnType<typeof setInterval> | null = null;

const sessionQuery = ref<any>({});
const sessionParams = ref({ page: 1, pageSize: 10, total: 0 });
const sessionData = ref<any[]>([]);
const sessionLoading = ref(false);

const canStart = computed(() => !!dockState.value?.liveEnabled && !!dockState.value?.hasCapacity);

/** 当前通道支持的镜头类型（来自 live_capacity.switchable_video_types） */
const switchableLens = computed(() => {
	const types: string[] = activeChannel.value?.switchableVideoTypes ?? [];
	return lensOptions.value.filter((m) => types.includes(m.value));
});

const activeChannel = computed(() => dockState.value?.channels?.find((m: any) => m.videoId === activeVideoId.value));

/** FPV 通道才能切舱内/舱外 */
const isFpv = computed(() => {
	const name = activeChannel.value?.channelName ?? activeChannel.value?.videoIndex ?? '';
	return String(name).toLowerCase().includes('fpv');
});

onMounted(async () => {
	await Promise.all([loadOptions(), loadDocks()]);
	await loadSessions();
});

onUnmounted(() => {
	stopStateTimer();
	destroyPlayer();
});

/* ------------------------------ 字典与下拉 ------------------------------ */

async function loadOptions() {
	const [quality, lens, status] = await Promise.all([
		qualityOptionsDjiLive().catch(() => null),
		lensOptionsDjiLive().catch(() => null),
		statusOptionsDjiLive().catch(() => null),
	]);
	qualityOptions.value = quality?.data?.result ?? [];
	lensOptions.value = lens?.data?.result ?? [];
	statusOptions.value = status?.data?.result ?? [];
}

async function loadDocks() {
	try {
		const res = await dockOptionsDjiLive(workspaceId.value);
		docks.value = res.data.result ?? [];
	} catch {
		docks.value = [];
	}
}

function dockOptionLabel(dock: any) {
	const online = dock.isOnline ? '在线' : '离线';
	const busy = dock.hasActiveSession ? ' · 直播中' : '';
	return `${dock.label}（${online}${busy}）`;
}

function handleWorkspaceChange() {
	dockSn.value = undefined;
	dockState.value = null;
	activeSession.value = null;
	activeVideoId.value = '';
	destroyPlayer();
	loadDocks();
}

/* ------------------------------ 机场状态 ------------------------------ */

async function loadDockState(silent = false) {
	if (!dockSn.value) return;
	if (!silent) stateLoading.value = true;
	try {
		const res = await dockStateDjiLive(dockSn.value);
		dockState.value = res.data.result ?? null;
		syncFromState();
		// 有在播通道时轮询，便于看到设备侧断流 / 错误码变化
		if (dockState.value?.liveCount > 0) startStateTimer();
		else stopStateTimer();
	} catch {
		if (!silent) ElMessage.error('获取机场直播状态失败');
	} finally {
		if (!silent) stateLoading.value = false;
	}
}

/**
 * 用最新的设备状态校正本地「当前会话」。
 *
 * 设备上报的 live_status 是权威真值：本地会话记录的是「平台下发过什么」，
 * 当设备侧已经不在播（例如中途断流）时必须把播放器停掉，否则页面会一直转圈。
 */
function syncFromState() {
	const channels = dockState.value?.channels ?? [];
	const selected = channels.find((m: any) => m.videoId === activeVideoId.value);

	// 用户点选过的通道只要还在通道列表里就保留高亮；否则自动跟随第一路在播通道
	if (!selected) {
		activeVideoId.value = channels.find((m: any) => m.isLive)?.videoId ?? '';
	}

	if (!activeSession.value) return;

	const current = channels.find((m: any) => m.videoId === activeSession.value.videoId);
	if (current && !current.isLive && isActiveStatus(activeSession.value.status)) {
		// 设备侧已停流：收口本地会话并停止播放
		activeSession.value.status = LiveStatus.Stopped;
		activeSession.value.statusName = '已停止';
		destroyPlayer();
		stopStateTimer();
		ElMessage.warning('设备侧已停止推流，播放结束');
	}
}

/**
 * 把某一路通道 / 会话载入播放器。
 *
 * 传入的两类对象结构不同：
 * - 通道列表给的是「能力」对象（`LiveChannelOutput`），只有 `sessionId`，没有播放地址；
 * - 历史列表给的是会话对象（`LiveSessionOutput`），已自带 `playUrl` / `hlsUrl`。
 * 这里统一补齐地址后再交给播放器，避免用通道对象直接播放时报「没有可用的播放地址」。
 */
async function previewChannel(row: any) {
	activeVideoId.value = row.videoId;
	controlQuality.value = row.videoQuality ?? 0;
	controlLens.value = row.videoType ?? '';

	let session = row;
	if (!row.playUrl && !row.hlsUrl) {
		const sessionId = row.sessionId ?? row.id;
		if (!sessionId) {
			activeSession.value = null;
			playerError.value = '该通道没有关联的直播会话，无法获取播放地址';
			return;
		}
		try {
			const res = await detailDjiLive(sessionId);
			session = res.data.result ?? row;
		} catch {
			// 请求拦截器已提示错误
			playerError.value = '获取直播会话详情失败，无法播放';
			return;
		}
	}

	activeSession.value = session;
	await restartPlayer();
}

/**
 * 点击左侧通道卡片：选中该路通道，在播时直接载入播放器。
 *
 * 空闲通道没有播放地址，只做高亮 + 提示，不去动正在播放的画面。
 */
async function selectChannel(channel: any) {
	activeVideoId.value = channel.videoId;

	if (!channel.isLive) {
		ElMessage.info('该通道当前未在播，点「开播」后即可观看');
		return;
	}

	// 已经在播同一路，避免无谓地重建播放器造成闪断
	if (activeSession.value?.videoId === channel.videoId) return;

	await previewChannel(channel);
}

/* ------------------------------ 开播 / 停播 ------------------------------ */

function openStartDialog(channel: any) {
	startChannel.value = channel;
	startQuality.value = 0;
	startVisible.value = true;
}

async function submitStart() {
	const channel = startChannel.value;
	if (!channel || !dockSn.value) return;

	starting.value = true;
	try {
		const res = await startDjiLive({ dockSn: dockSn.value, videoId: channel.videoId, videoQuality: startQuality.value });
		activeSession.value = res.data.result ?? null;
		activeVideoId.value = channel.videoId;
		controlQuality.value = activeSession.value?.videoQuality ?? startQuality.value;
		controlLens.value = activeSession.value?.videoType ?? '';
		startVisible.value = false;
		ElMessage.success('开播指令已下发');
		await loadDockState(true);
		await restartPlayer();
		await loadSessions();
	} catch {
		// 请求拦截器已提示错误
	} finally {
		starting.value = false;
	}
}

/**
 * 停播。
 * @param row 会话（通道或历史记录行）
 * @param fromHistory 从历史列表触发时，停播后要同时刷新两处数据
 */
async function handleStop(row: any, fromHistory = false) {
	const sessionId = row.sessionId ?? row.id;
	if (!sessionId) {
		ElMessage.warning('未找到会话记录，无法停播');
		return;
	}

	await ElMessageBox.confirm('确定要停止该路直播吗？机场会立即停止推流。', '停播确认', {
		type: 'warning',
		confirmButtonText: '确定停播',
		cancelButtonText: '取消',
	});

	controlling.value = true;
	try {
		await stopDjiLive(sessionId);
		ElMessage.success('停播指令已下发');
		// 无论设备是否回包都收口本地状态：指令已送达，继续显示「直播中」只会误导用户
		if (activeSession.value?.id === sessionId) {
			activeSession.value.status = LiveStatus.Stopped;
			activeSession.value.statusName = '已停止';
			destroyPlayer();
			stopStateTimer();
		}
		await loadDockState(true);
		await loadSessions();
	} catch {
		// 请求拦截器已提示错误
	} finally {
		controlling.value = false;
	}
}

async function handleStopSession() {
	if (!activeSession.value) return;
	await handleStop(activeSession.value);
}

/* ------------------------------ 直播控制 ------------------------------ */

async function handleQualityChange(value: number) {
	if (!activeSession.value) return;
	try {
		await setQualityDjiLive(activeSession.value.id, value);
		ElMessage.success('清晰度调整指令已下发');
	} catch {
		controlQuality.value = activeSession.value.videoQuality ?? 0;
	}
}

async function handleLensChange(value: string) {
	if (!activeSession.value) return;
	try {
		await lensChangeDjiLive(activeSession.value.id, value);
		ElMessage.success('镜头切换指令已下发');
	} catch {
		controlLens.value = activeSession.value.videoType ?? '';
	}
}

async function handleCameraChange(value: number) {
	if (!activeSession.value) return;
	try {
		await cameraChangeDjiLive(activeSession.value.id, value);
		ElMessage.success('FPV 位置切换指令已下发');
	} catch {
		// 请求拦截器已提示错误
	}
}

/* ------------------------------ 播放器 ------------------------------ */

/** 先尝试 HTTP-FLV，失败或浏览器不支持时回退 HLS */
async function restartPlayer() {
	if (!activeSession.value) return;
	const flvUrl = activeSession.value.playUrl;
	const hlsUrl = activeSession.value.hlsUrl;

	if (!flvUrl && !hlsUrl) {
		playerError.value = '该会话没有可用的播放地址，请检查 Dji.json 的 FlvPlayBaseUrl / HlsPlayBaseUrl 配置';
		return;
	}

	await nextTick();
	destroyPlayer();
	playerError.value = '';

	if (flvUrl && flvjs.isSupported()) {
		playFlv(flvUrl, hlsUrl);
		return;
	}
	if (hlsUrl) {
		playHls(hlsUrl);
		return;
	}
	playerError.value = '当前浏览器不支持 HTTP-FLV（需 MSE），且未配置 HLS 兜底地址';
}

function playFlv(url: string, fallbackHlsUrl?: string) {
	const video = videoRef.value;
	if (!video) return;

	try {
		flvPlayer = flvjs.createPlayer({ type: 'flv', isLive: true, url, hasAudio: true }, { enableStashBuffer: false, stashInitialSize: 128 });
		flvPlayer.attachMediaElement(video);
		flvPlayer.load();
		flvPlayer.play().catch(() => {});
		flvPlayer.on(flvjs.Events.ERROR, (type: string, detail: string) => {
			// 流还没起来时（推送端未就绪）报错很常见，回退 HLS 再试一次
			if (fallbackHlsUrl) {
				destroyPlayer();
				ElMessage.warning(`HTTP-FLV 播放失败（${detail}），已切换 HLS 兜底`);
				playHls(fallbackHlsUrl);
				return;
			}
			playerError.value = `HTTP-FLV 播放失败：${type} ${detail}`;
		});
	} catch (e: any) {
		playerError.value = `播放器初始化失败：${e?.message ?? e}`;
	}
}

function playHls(url: string) {
	const video = videoRef.value;
	if (!video) return;

	if (Hls.isSupported()) {
		hlsPlayer = new Hls({ liveDurationInfinity: true, lowLatencyMode: true });
		hlsPlayer.loadSource(url);
		hlsPlayer.attachMedia(video);
		hlsPlayer.on(Hls.Events.ERROR, (_evt: any, data: any) => {
			if (data?.fatal) playerError.value = `HLS 播放失败：${data.type} / ${data.details}`;
		});
		video.play().catch(() => {});
		return;
	}

	// Safari 原生支持 HLS
	if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = url;
		video.play().catch(() => {});
		return;
	}

	playerError.value = '当前浏览器不支持 HLS 播放';
}

function destroyPlayer() {
	if (flvPlayer) {
		try {
			flvPlayer.pause();
			flvPlayer.unload();
			flvPlayer.detachMediaElement();
			flvPlayer.destroy();
		} catch {
			// 忽略销毁期异常
		}
		flvPlayer = null;
	}
	if (hlsPlayer) {
		try {
			hlsPlayer.destroy();
		} catch {
			// 忽略销毁期异常
		}
		hlsPlayer = null;
	}
	const video = videoRef.value;
	if (video) {
		video.removeAttribute('src');
		video.load();
	}
}

function startStateTimer() {
	if (stateTimer) return;
	// 5 秒一次；设备只在状态变化时推送，这里轮询的是本地快照，不会打到设备
	stateTimer = setInterval(() => loadDockState(true), 5000);
}

function stopStateTimer() {
	if (!stateTimer) return;
	clearInterval(stateTimer);
	stateTimer = null;
}

/* ------------------------------ 历史会话 ------------------------------ */

function handleSessionQuery() {
	sessionParams.value.page = 1;
	loadSessions();
}

async function loadSessions() {
	sessionLoading.value = true;
	try {
		const res = await pageDjiLive(Object.assign({}, sessionQuery.value, sessionParams.value));
		sessionData.value = res.data.result?.items ?? [];
		sessionParams.value.total = res.data.result?.total ?? 0;
	} catch {
		sessionData.value = [];
	} finally {
		sessionLoading.value = false;
	}
}

/* ------------------------------ 展示辅助 ------------------------------ */

function isActiveStatus(status: number) {
	return status === LiveStatus.Starting || status === LiveStatus.Live;
}

function statusTagType(status: number) {
	switch (status) {
		case LiveStatus.Live:
			return 'success';
		case LiveStatus.Starting:
			return 'warning';
		case LiveStatus.Failed:
			return 'danger';
		default:
			return 'info';
	}
}

function qualityLabel(value: number) {
	return qualityOptions.value.find((m) => m.value === value)?.label ?? String(value);
}

function lensLabel(value: string) {
	return lensOptions.value.find((m) => m.value === value)?.label ?? value ?? '-';
}

function formatDateTime(value?: string) {
	if (!value) return '';
	return formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS');
}
</script>

<style scoped lang="scss">
.channel-list {
	max-height: 560px;
	overflow-y: auto;
}

.channel-item {
	padding: 10px 12px;
	margin-bottom: 8px;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		border-color: var(--el-color-primary-light-5);
	}

	&.active {
		border-color: var(--el-color-primary);
		background: var(--el-color-primary-light-9);
	}
}

.player-box {
	width: 100%;
	min-height: 320px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #000;
	border-radius: 6px;
	overflow: hidden;
}

.player-video {
	width: 100%;
	max-height: 60vh;
	background: #000;
}
</style>
