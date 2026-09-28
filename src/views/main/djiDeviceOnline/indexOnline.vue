<template>
	<div style="display: block" v-loading="loading">
		<el-empty description="暂无在线机场." v-if="!allDockOsds || allDockOsds.length == 0" />
		<!-- 第一个设备 -->
		<el-card class="device-card" shadow="never" v-for="(item, index) in allDockOsds" :key="index">
			<div class="card-header">
				<div style="display: flex; align-items: center">
					<div class="status-dot green" style=""></div>
					<div v-html="renderModeCodeTag(item.modeCode)"></div>
					<div style="float: right">{{ item.sn }}</div>
				</div>
				<div>{{ item.nick }}</div>
			</div>

			<div class="card-body">
				<div class="image-container">
					<img :src="dockImg" />
				</div>
				<div class="metrics-grid">
					<div class="metric-item">
						<div class="value">{{ Number(item.accTime / 60 / 60).toFixed(2) }}小时</div>
						<div class="label">累计运行</div>
					</div>
					<div class="metric-item">
						<div class="value">{{ item.jobNumber }}次</div>
						<div class="label">累计作业</div>
					</div>
					<div class="metric-item">
						<div class="value" v-html="renderFlighttaskStepCodeTag(item.flighttaskStepCode)"></div>
						<div class="label">任务状态</div>
					</div>
					<div class="metric-item">
						<div class="value" v-html="render01Tag(item.droneInDock, '舱内', '舱外')"></div>
						<div class="label">飞行器是否在舱</div>
					</div>
					<div class="metric-item">
						<div class="value">{{ item.networkState?.rate }}KB/s</div>
						<div class="label">网络</div>
					</div>
					<div class="metric-item">
						<div class="value" v-html="render01Tag(!!item.alternateLandPoint && item.alternateLandPoint!.latitude > 0, '已设置', '未设置')"></div>
						<div class="label">备降点</div>
					</div>

					<div class="metric-item">
						<div class="value" v-html="renderAirConditionerStateTag(item.airConditioner?.airConditionerState)"></div>
						<div class="label">空调状态</div>
					</div>
					<div class="metric-item">
						<div class="value">
							<span>{{ item.droneChargeState?.capacityPercent }}%</span>
							(<span v-html="render01Tag(item.droneChargeState?.state == 1, '充电中', '空闲', { val1Color: '#F7CB09FF', otherColor: '#52c41a' })"></span>)
						</div>
						<div class="label">飞行器充电状态</div>
					</div>
					<div class="metric-item">
						<div class="value" v-html="renderRainfallTag(item.rainfall)"></div>
						<div class="label">降雨量</div>
					</div>
					<div class="metric-item">
						<div class="value">{{ item.windSpeed }} m/s</div>
						<div class="label">风速</div>
					</div>
					<div class="metric-item">
						<div class="value">{{ item.temperature }}°C</div>
						<div class="label">舱内温度</div>
					</div>
					<div class="metric-item">
						<div class="value">{{ item.humidity }} %</div>
						<div class="label">舱内湿度</div>
					</div>
				</div>
				<!-- <div class="button-group">
					<el-button type="primary" size="small" class="custom-btn">操作中心</el-button>
					<el-button type="success" size="small" class="custom-btn">航线任务</el-button>
				</div> -->
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDeviceStore } from '../../../stores/useDeviceStore';
import { render01Tag, renderAirConditionerStateTag, renderFlighttaskStepCodeTag, renderModeCodeTag, renderRainfallTag, renderRtkSourceTypeTag } from '/@/types/mqtt/osd/dockOsdMapping';
import { DockOsd } from '/@/types/mqtt/osd/dockOsd';
import { getDockOnlineSnapshots } from '/@/api/mainCloud/cloudDevice';
import dockImg from '/@/assets/dock.png';

const deviceStore = useDeviceStore();
const loading = ref(false);

const allDockOsds = computed((): DockOsd[] => {
	return Array.from(deviceStore.$state.dockOsds.values());
});

/**
 * 拉取在线快照完成首屏渲染。
 *
 * 列表数据源是 SignalR 实时推送 + 内存 Map，若只依赖实时推送，
 * 页面刷新、断线重连、后端重启期间都会一片空白，因此挂载时先补齐一次快照，
 * 之后由 SignalR 增量覆盖（store 内部的 addDockOsd 是合并写入，不会互相冲掉）。
 */
const loadSnapshot = async () => {
	loading.value = true;
	try {
		const res = await getDockOnlineSnapshots();
		const list = res.data?.result ?? [];
		list.forEach((item: any) => {
			if (!item?.osd) return;
			deviceStore.addDockOsd(item.sn, { ...item.osd, nick: item.nick ?? item.osd.nick });
		});
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	loadSnapshot();
});
</script>

<style scoped>
.device-card {
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 0 20px rgba(0, 187, 255, 0.3);
	position: relative;
	margin-bottom: 20px;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: between;
	gap: 8px;
	padding: 10px 20px;
	color: #00bfff;
	font-size: 14px;
	border-bottom: 1px solid #00bfff;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: #00bfff;
}

.green {
	background-color: #0f0;
}

.card-body {
	padding: 20px;
	display: flex;
	gap: 20px;
}

.image-container {
	width: 220px;
	min-height: 120px;
	border: 1px solid #00bfff;
	border-radius: 8px;
	overflow: hidden;
}

.image-container img {
	width: 100%;
	height: 100%;
	display: block;
}

.metrics-grid {
	flex: 3;
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 16px;
	font-size: 14px;
}

.metric-item {
	text-align: center;
}

.value {
	font-size: 16px;
	font-weight: bold;
	margin-bottom: 4px;
}

.label {
	font-size: 12px;
	color: #aaa;
}

.button-group {
	display: flex;
	justify-content: space-between;
	margin-top: 20px;
	gap: 10px;
}

.custom-btn {
	border-radius: 6px;
	padding: 6px 16px;
	font-size: 12px;
	background-color: #00bfff;
	color: #fff;
	border: none;
	box-shadow: 0 0 8px rgba(0, 187, 255, 0.5);
	transition: all 0.3s ease;
}

.custom-btn:hover {
	background-color: #00aaff;
	transform: scale(1.05);
}

/* 蓝色边框装饰 */
.device-card::before {
	content: '';
	position: absolute;
	top: -10px;
	left: -10px;
	right: -10px;
	bottom: -10px;
	border: 2px solid #00bfff;
	border-radius: 10px;
	z-index: -1;
	opacity: 0.6;
}
</style>
