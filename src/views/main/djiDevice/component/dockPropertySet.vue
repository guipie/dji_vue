<template>
	<el-drawer v-model="drawer" title="机场属性配置与远程调试" :with-header="true" :size="'30%'" direction="rtl" :close-on-press-escape="true" :destroy-on-close="true">
		<div class="debug-panel">
			<!-- 飞行器属性设置 -->
			<el-card class="setting-card" title="飞行器属性设置">
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="飞行器夜航灯" label-width="120px">
							<el-input v-model="nightLight" placeholder="--" disabled />
							<el-button type="primary" size="small" @click="edit('nightLight')">Edit</el-button>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="限高" label-width="120px">
							<el-input v-model="altitudeLimit" placeholder="-- m" disabled />
							<el-button type="primary" size="small" @click="edit('altitudeLimit')">Edit</el-button>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="限远" label-width="120px">
							<el-input v-model="distanceLimit" placeholder="--" disabled />
							<el-button type="primary" size="small" @click="edit('distanceLimit')">Edit</el-button>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="水平避障" label-width="120px">
							<el-input v-model="horizontalObstacle" placeholder="--" disabled />
							<el-button type="primary" size="small" @click="edit('horizontalObstacle')">Edit</el-button>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="上视避障" label-width="120px">
							<el-input v-model="topObstacle" placeholder="--" disabled />
							<el-button type="primary" size="small" @click="edit('topObstacle')">Edit</el-button>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="下视避障" label-width="120px">
							<el-input v-model="bottomObstacle" placeholder="--" disabled />
							<el-button type="primary" size="small" @click="edit('bottomObstacle')">Edit</el-button>
						</el-form-item>
					</el-col>
				</el-row>
			</el-card>

			<!-- 设备远程调试 -->
			<el-card class="debug-card" title="设备远程调试">
				<el-switch v-model="remoteDebug" active-text="开" inactive-text="关" active-color="#13ce66" inactive-color="#ff4949" />

				<el-row :gutter="20" style="margin-top: 20px">
					<!-- 左侧列 -->
					<el-col :span="12">
						<el-form-item label="机场系统" label-width="120px">
							<el-tag type="success">工作中</el-tag>
							<el-button type="primary" size="small" @click="restartSystem">重启</el-button>
						</el-form-item>
						<el-form-item label="舱盖" label-width="120px">
							<el-tag type="danger">关</el-tag>
							<el-button type="primary" size="small" @click="openHatch">开启</el-button>
						</el-form-item>
						<el-form-item label="充电状态" label-width="120px">
							<el-tag type="warning">未充电</el-tag>
							<el-button type="primary" size="small" @click="startCharge">充电</el-button>
						</el-form-item>
						<el-form-item label="飞行器存储" label-width="120px">
							<el-tag type="info">--</el-tag>
							<el-button type="primary" size="small" @click="formatStorage">格式化</el-button>
						</el-form-item>
						<el-form-item label="机场声光报警" label-width="120px">
							<el-tag type="danger">关</el-tag>
							<el-button type="primary" size="small" @click="enableAlarm">打开</el-button>
						</el-form-item>
						<el-form-item label="飞机电池保养" label-width="120px">
							<el-tag type="warning">无需保养</el-tag>
							<el-button type="primary" size="small" @click="maintenance">保养</el-button>
						</el-form-item>
					</el-col>

					<!-- 右侧列 -->
					<el-col :span="12">
						<el-form-item label="飞行器" label-width="120px">
							<el-tag type="danger">关</el-tag>
							<el-button type="primary" size="small" @click="powerOn">开机</el-button>
						</el-form-item>
						<el-form-item label="推杆" label-width="120px">
							<el-tag type="info">闭合</el-tag>
							<el-button type="primary" size="small" @click="extendPusher">展开</el-button>
						</el-form-item>
						<el-form-item label="机场存储" label-width="120px">
							<el-tag type="info">0.0/50.6 G</el-tag>
							<el-button type="primary" size="small" @click="formatAirportStorage">格式化</el-button>
						</el-form-item>
						<el-form-item label="补光灯" label-width="120px">
							<el-tag type="danger">关</el-tag>
							<el-button type="primary" size="small" @click="turnOnLight">打开</el-button>
						</el-form-item>
						<el-form-item label="机场电池存储模式" label-width="120px">
							<el-tag type="info">待命</el-tag>
							<el-button type="primary" size="small" @click="planMode">计划</el-button>
						</el-form-item>
						<el-form-item label="4g 增强" label-width="120px">
							<el-tag type="success">开</el-tag>
							<el-button type="primary" size="small" @click="disable4G">关闭</el-button>
						</el-form-item>
					</el-col>
				</el-row>
			</el-card>
		</div>
	</el-drawer>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({
	device: {
		type: Object,
		default: () => ({}),
	},
	value: {
		type: Boolean,
		default: false,
	},
});
// 数据绑定
const nightLight = ref('--');
const altitudeLimit = ref('-- m');
const distanceLimit = ref('--');
const horizontalObstacle = ref('--');
const topObstacle = ref('--');
const bottomObstacle = ref('--');

// 远程调试开关
const remoteDebug = ref(false);

// 各项状态
const edit = (field) => {
	alert(`编辑 ${field} 字段`);
};

// 操作函数
const restartSystem = () => alert('重启机场系统');
const openHatch = () => alert('开启舱盖');
const startCharge = () => alert('开始充电');
const formatStorage = () => alert('格式化飞行器存储');
const enableAlarm = () => alert('开启声光报警');
const maintenance = () => alert('执行电池保养');

const powerOn = () => alert('飞行器开机');
const extendPusher = () => alert('推杆展开');
const formatAirportStorage = () => alert('格式化机场存储');
const turnOnLight = () => alert('补光灯打开');
const planMode = () => alert('进入计划模式');
const disable4G = () => alert('关闭4G增强');

// 样式
</script>

<style scoped>
.debug-panel {
	padding: 20px;
}

.setting-card,
.debug-card {
	margin-bottom: 20px;
	border: 1px solid #2d2d2d;
	color: #fff;
}

.setting-card .el-form-item {
	margin-bottom: 12px;
}

.el-form-item__label {
	font-weight: bold;
	color: #00bfff;
}

.el-input,
.el-switch {
	width: 100%;
}

.el-button {
	float: right;
	margin-left: 8px;
}

.el-switch {
	margin-right: 10px;
}
</style>
