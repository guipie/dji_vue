<template>
	<div class="djiDock-container">
		<!-- 目标机场选择：控制面板的一切都以「选中哪台机场」为前提 -->
		<el-card shadow="hover" class="mb10 min-h-50px" :body-style="{ padding: '12px 16px' }">
			<div class="flex items-center flex-wrap">
				<span class="text-xs c-gray mr-2">目标机场</span>
				<el-select v-model="dockSn" filterable clearable placeholder="请选择机场" style="width: 340px" @change="handleDockChange">
					<el-option v-for="dock in docks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
				</el-select>
				<el-button class="ml-2" icon="ele-Refresh" :loading="loading" @click="loadAll"> 刷新 </el-button>
				<span v-if="osd" class="text-xs c-gray ml-4">设备状态实时推送中</span>
				<span v-else-if="dockSn" class="text-xs c-warning ml-4">该机场尚未上报过状态（OSD）</span>
			</div>
		</el-card>

		<el-empty v-if="!dockSn" description="请先在上方选择一台机场" />

		<template v-else>
			<!-- 概览：先把「能不能动它」讲清楚，再谈能做什么 -->
			<el-row :gutter="8" class="mb10">
				<el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
					<el-card style="height: 100%" shadow="hover" :body-style="{ padding: '12px 16px' }">
						<div class="text-xs c-gray">设备状态</div>
						<div class="text-2xl font-bold mt-1" :class="state?.isOnline ? 'c-success' : 'c-danger'">
							{{ state?.isOnline ? '在线' : '离线' }}
						</div>
					</el-card>
				</el-col>
				<el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
					<el-card style="height: 100%" shadow="hover" :body-style="{ padding: '12px 16px' }">
						<div class="text-xs c-gray">工作状态</div>
						<div class="text-2xl font-bold mt-1" :class="osdIsIdle ? 'c-success' : 'c-warning'">
							{{ osdModeName || '未知' }}
						</div>
						<div class="text-xs c-gray">{{ osdFlighttaskStepName || '暂无任务阶段' }}</div>
					</el-card>
				</el-col>
				<el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
					<el-card style="height: 100%" shadow="hover" :body-style="{ padding: '12px 16px' }">
						<div class="text-xs c-gray">活跃告警</div>
						<div class="text-2xl font-bold mt-1" :class="{ 'c-danger': (state?.activeAlarmCount ?? 0) > 0 }">
							{{ state?.activeAlarmCount ?? 0 }}
						</div>
						<div v-if="(state?.warningAlarmCount ?? 0) > 0" class="text-xs c-danger">其中警告级 {{ state.warningAlarmCount }}</div>
					</el-card>
				</el-col>
				<el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
					<el-card style="height: 100%" shadow="hover" :body-style="{ padding: '12px 16px' }">
						<div class="text-xs c-gray">在途指令</div>
						<div class="text-2xl font-bold mt-1">{{ state?.runningCommands?.length ?? 0 }}</div>
						<div class="text-xs c-gray">已下发尚未结束</div>
					</el-card>
				</el-col>
				<el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
					<el-card style="height: 100%" shadow="hover" :body-style="{ padding: '12px 16px' }">
						<div class="text-xs c-gray">飞行器电量</div>
						<div class="text-2xl font-bold mt-1">
							{{ osd?.droneChargeState?.capacityPercent != null ? `${osd.droneChargeState.capacityPercent}%` : '-' }}
						</div>
						<div class="text-xs c-gray">{{ osdDroneInDockName || '在舱状态未知' }}</div>
					</el-card>
				</el-col>
				<el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
					<el-card style="height: 100%" shadow="hover" :body-style="{ padding: '12px 16px' }">
						<div class="text-xs c-gray">固件版本</div>
						<div class="text-2xl font-bold mt-1" style="font-size: 18px">{{ osd?.firmwareVersion || '-' }}</div>
						<div class="text-xs c-gray">{{ state?.model || '' }}</div>
					</el-card>
				</el-col>
			</el-row>

			<el-row :gutter="8">
				<!-- 左：状态快照 -->
				<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<el-card shadow="hover" class="full-table">
						<template #header>
							<div class="flex items-center">
								<span class="font-bold">状态快照</span>
								<el-tag v-if="osd?.emergencyStopState === 1" type="danger" size="small" class="ml-2" effect="dark">急停已按下</el-tag>
								<el-tag v-if="osd?.silentMode === 1" type="info" size="small" class="ml-2" effect="plain">静音模式</el-tag>
							</div>
						</template>

						<el-descriptions :column="2" border size="small">
							<el-descriptions-item label="舱盖">{{ osdCoverStateName || '-' }}</el-descriptions-item>
							<el-descriptions-item label="推杆">{{ state?.putterStateName || '-' }}</el-descriptions-item>
							<el-descriptions-item label="飞行器">{{ osdDroneInDockName || '-' }}</el-descriptions-item>
							<el-descriptions-item label="充电">{{ osd?.droneChargeState?.state === 1 ? '充电中' : osd?.droneChargeState?.state === 0 ? '空闲' : '-' }}</el-descriptions-item>
							<el-descriptions-item label="空调">
								{{ osd?.airConditioner ? AirConditionerStateNameMap[osd.airConditioner.airConditionerState] || '-' : '-' }}
								<span v-if="(osd?.airConditioner?.switchTime ?? 0) > 0" class="text-xs c-warning">（切换中 {{ osd?.airConditioner?.switchTime }}s）</span>
							</el-descriptions-item>
							<el-descriptions-item label="补光灯">{{ osd?.supplementLightState === 1 ? '开启' : osd?.supplementLightState === 0 ? '关闭' : '-' }}</el-descriptions-item>
							<el-descriptions-item label="声光报警">{{ osd?.alarmState === 1 ? '开启' : osd?.alarmState === 0 ? '关闭' : '-' }}</el-descriptions-item>
							<el-descriptions-item label="电池模式">{{ osdBatteryStoreModeName || '-' }}</el-descriptions-item>
							<el-descriptions-item label="增强图传">{{ osdSdrLinkWorkmodeName || '-' }}</el-descriptions-item>
							<el-descriptions-item label="机场坐标">
								<span class="font-mono text-xs">{{ formatCoord(osd?.longitude, osd?.latitude) }}</span>
							</el-descriptions-item>
							<el-descriptions-item label="舱内温湿度">{{ formatTemp(osd?.temperature) }} / {{ formatHumidity(osd?.humidity) }}</el-descriptions-item>
							<el-descriptions-item label="环境">{{ formatTemp(osd?.environmentTemperature) }}，风速 {{ formatSpeed(osd?.windSpeed) }}</el-descriptions-item>
							<el-descriptions-item label="降雨">{{ rainfallText }}</el-descriptions-item>
							<el-descriptions-item label="市电电压">{{ state?.electricSupplyVoltage != null ? `${state.electricSupplyVoltage} V` : '-' }}</el-descriptions-item>
							<el-descriptions-item label="存储">{{ storageText }}</el-descriptions-item>
							<el-descriptions-item label="作业次数">{{ osd?.jobNumber ?? '-' }}</el-descriptions-item>
							<el-descriptions-item label="累计运行">{{ formatAccTime(osd?.accTime) }}</el-descriptions-item>
						</el-descriptions>

						<!-- 在途指令：用户点完按钮后最想知道的就是它到底做完没有 -->
						<div v-if="(state?.runningCommands?.length ?? 0) > 0" class="mt10">
							<div class="text-xs c-gray mb-1">执行中的指令</div>
							<div v-for="cmd in state.runningCommands" :key="cmd.id" class="mb-1">
								<div class="flex items-center">
									<span class="text-xs mr-2">{{ cmd.actionName }}</span>
									<span class="text-xs c-gray">{{ cmd.statusName }}</span>
									<span class="text-xs c-gray ml-2">{{ cmd.percent ?? 0 }}%</span>
								</div>
								<el-progress :percentage="cmd.percent ?? 0" :stroke-width="6" />
							</div>
						</div>
					</el-card>
				</el-col>

				<!-- 右：控制指令 -->
				<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<el-card shadow="hover">
						<template #header>
							<div class="flex items-center">
								<span class="font-bold">远程控制</span>
								<span class="text-xs c-gray ml-2">开关跟随机场实时状态回显，切换即下发</span>
								<el-button class="ml-auto" size="small" type="danger" plain :disabled="(state?.runningCommands?.length ?? 0) === 0" @click="handleClearRunning"> 清除所有指令 </el-button>
							</div>
						</template>

						<div v-loading="actionLoading || executing" :element-loading-text="executing ? '指令下发中…' : ''">
							<!-- 重要指令：远程调试开关 + 一键标定（独立于普通分组，醒目展示） -->
							<div class="mb10 pb-2" style="border-bottom: 1px dashed var(--el-border-color-lighter)">
								<div class="text-xs c-gray mb-1">重要操作</div>
								<div class="flex flex-wrap items-center">
									<template v-for="act in maintainActions" :key="act.method">
										<!-- 远程调试：开关 -->
										<el-tooltip v-if="act.toggle" :disabled="act.available" :content="act.disabledReason || ''" placement="top">
											<div class="mr-4 mb-1 flex items-center">
												<span class="text-xs mr-2" :class="{ 'c-gray': !act.available }">{{ act.name }}</span>
												<el-switch
													:model-value="toggleCurrentOn(act)"
													active-text="开"
													inactive-text="关"
													:disabled="!act.available || executing || toggleCurrentOn(act) == null"
													:loading="switchLoading(act)"
													@change="(val: boolean) => handleToggle(act, val)"
												/>
											</div>
										</el-tooltip>
										<!-- 一键标定：按钮 -->
										<el-tooltip v-else :disabled="act.available" :content="act.disabledReason || ''" placement="top">
											<span class="mr-2 mb-1">
												<el-button :type="buttonType(act)" size="small" plain :disabled="!act.available || executing" @click="handleAction(act)">
													{{ act.name }}
												</el-button>
											</span>
										</el-tooltip>
									</template>
								</div>
							</div>

							<div v-for="group in actionGroups" :key="group.name" class="mb10">
								<div class="text-xs c-gray mb-1">{{ group.name }}</div>
								<div class="flex flex-wrap items-center">
									<template v-for="act in group.actions" :key="act.method">
										<!-- 开关类指令：渲染为 switch，初始/实时状态由 OSD 回读驱动 -->
										<el-tooltip v-if="act.toggle" :disabled="act.available" :content="act.disabledReason || ''" placement="top">
											<div class="mr-4 mb-1 flex items-center">
												<span class="text-xs mr-2" :class="{ 'c-gray': !act.available }">{{ act.name }}</span>
												<el-switch
													:model-value="toggleCurrentOn(act)"
													active-text="开"
													inactive-text="关"
													:disabled="!act.available || executing || toggleCurrentOn(act) == null"
													:loading="switchLoading(act)"
													@change="(val: boolean) => handleToggle(act, val)"
												/>
											</div>
										</el-tooltip>

										<!-- 一次性动作：保留按钮 -->
										<el-tooltip v-else :disabled="act.available" :content="act.disabledReason || ''" placement="top">
											<span class="mr-2 mb-1">
												<el-button :type="buttonType(act)" size="small" plain :disabled="!act.available || executing" @click="handleAction(act)">
													{{ act.name }}
												</el-button>
											</span>
										</el-tooltip>
									</template>
								</div>
							</div>

							<el-alert type="info" :closable="false" show-icon class="mt10">
								<template #title>
									<span class="text-xs">
										开关切换会立即下发指令，并跟随机场 OSD 实时回显；「打开舱盖」「格式化」等一次性动作执行需几十秒到数分钟，进度通过 MQTT 异步回写，请在下方「操作日志」查看最终结果。
									</span>
								</template>
							</el-alert>
						</div>
					</el-card>
				</el-col>
			</el-row>

			<!-- 操作日志：这张表同时充当操作审计 -->
			<el-card class="full-table" shadow="hover" style="margin-top: 8px">
				<template #header>
					<div class="flex items-center">
						<span class="font-bold">操作日志</span>
						<span class="text-xs c-gray ml-2">谁在什么时候对这台机场做了什么、结果如何</span>
					</div>
				</template>

				<el-table :data="records" style="width: 100%" v-loading="loading" size="small" border>
					<el-table-column prop="createTime" label="下发时间" width="160">
						<template #default="scope">{{ formatDateTime(scope.row.createTime) }}</template>
					</el-table-column>
					<el-table-column prop="actionName" label="操作" width="140" />
					<el-table-column label="风险" width="80" align="center">
						<template #default="scope">
							<el-tag size="small" effect="plain" :type="riskTagType(scope.row.riskLevel)">{{ scope.row.riskName }}</el-tag>
						</template>
					</el-table-column>
					<el-table-column label="状态" width="100" align="center">
						<template #default="scope">
							<el-tag size="small" effect="plain" :type="statusTagType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
						</template>
					</el-table-column>
					<el-table-column label="进度" min-width="140">
						<template #default="scope">
							<el-progress v-if="scope.row.isRunning" :percentage="scope.row.percent ?? 0" :stroke-width="8" />
							<span v-else class="text-xs c-gray">{{ scope.row.stepKey || '-' }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="errorMessage" label="结果说明" min-width="180" show-overflow-tooltip>
						<template #default="scope">
							<span :class="{ 'c-danger': scope.row.result !== 0 }">{{ scope.row.errorMessage || (scope.row.result === 0 ? '成功' : `错误码 ${scope.row.result}`) }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="operatorName" label="操作人" width="110" />
					<el-table-column prop="finishTime" label="结束时间" width="160">
						<template #default="scope">{{ formatDateTime(scope.row.finishTime) }}</template>
					</el-table-column>
				</el-table>
			</el-card>
		</template>

		<!-- 有参指令 -->
		<el-dialog v-model="paramVisible" :title="`下发指令：${current?.name || ''}`" width="480px">
			<el-alert v-if="current?.needConfirm" :type="current.riskLevel === 2 ? 'error' : 'warning'" :closable="false" show-icon class="mb10">
				<template #title>
					<span class="text-xs">
						【{{ current.name }}】属于「{{ current.riskName }}」级操作<template v-if="current.riskLevel === 2">，其中格式化操作<b>不可恢复</b></template
						>，请确认现场安全后再下发。
					</span>
				</template>
			</el-alert>

			<el-form :model="form" label-width="110">
				<el-form-item v-if="hasField('action')" label="目标状态">
					<el-select v-model="form.action" placeholder="请选择" style="width: 100%">
						<el-option v-for="opt in actionPreset" :key="opt.value" :label="opt.label" :value="opt.value" />
					</el-select>
				</el-form-item>
				<el-form-item v-if="hasField('linkWorkmode')" label="图传模式">
					<el-radio-group v-model="form.linkWorkmode">
						<el-radio :value="0">仅 SDR</el-radio>
						<el-radio :value="1">4G 增强</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-if="hasField('imei')" label="Dongle IMEI">
					<el-input v-model="form.imei" placeholder="可在机场设备信息中查看" />
				</el-form-item>
				<el-form-item v-if="hasField('deviceType')" label="目标设备">
					<el-radio-group v-model="form.deviceType">
						<el-radio value="dock">机场</el-radio>
						<el-radio value="drone">飞行器</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-if="hasField('simSlot')" label="SIM 卡槽">
					<el-radio-group v-model="form.simSlot">
						<el-radio :value="1">实体 SIM 卡</el-radio>
						<el-radio :value="2">eSIM</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-if="hasField('esimOperator')" label="运营商">
					<el-radio-group v-model="form.esimOperator">
						<el-radio :value="1">中国移动</el-radio>
						<el-radio :value="2">中国联通</el-radio>
						<el-radio :value="3">中国电信</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="paramVisible = false">取消</el-button>
				<el-button type="primary" :loading="submitting" @click="submitAction">{{ current?.needConfirm ? '确认下发' : '下发' }}</el-button>
			</template>
		</el-dialog>

		<!-- RTK 一键标定 -->
		<el-dialog v-model="rtkVisible" title="RTK 一键标定" width="480px">
			<el-alert type="warning" :closable="false" show-icon class="mb10">
				<template #title>
					<span class="text-xs">标定会重置机场 RTK 基准，过程中需要飞行器开机。请填写已知坐标点的经纬高。</span>
				</template>
			</el-alert>

			<el-form :model="form" label-width="110">
				<el-form-item label="经度">
					<el-input-number v-model="form.longitude" :precision="8" :step="0.0000001" style="width: 100%" />
				</el-form-item>
				<el-form-item label="纬度">
					<el-input-number v-model="form.latitude" :precision="8" :step="0.0000001" style="width: 100%" />
				</el-form-item>
				<el-form-item label="椭球高度(m)">
					<el-input-number v-model="form.height" :precision="3" style="width: 100%" />
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="rtkVisible = false">取消</el-button>
				<el-button type="primary" :loading="submitting" @click="submitAction">确认标定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="djiDock">
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { actionsDjiDock, clearRunningDjiDock, dockOptionsDjiDock, executeDjiDock, recentDjiDock, rtkCalibrationDjiDock, stateDjiDock } from '/@/api/main/djiDock';
import { useDeviceStore } from '/@/stores/useDeviceStore';
import { DockOsd, ModeCodeEnum } from '/@/types/mqtt/osd/dockOsd';
import { formatDate } from '/@/utils/formatTime';

const deviceStore = useDeviceStore();

/** 与后端 DockCommandRiskEnum 对应（0 普通 / 1 需谨慎 / 2 危险） */
const Risk = { Normal: 0, Caution: 1, Dangerous: 2 };

/**
 * 分组展示顺序。
 *
 * 后端返回的 `group` 已经是中文分组名，这里补一份顺序权重就够了：
 * 危险的放最后、日常操作放最前，能显著降低误点概率。
 * 注意：维护组（远程调试、一键标定）不在这里渲染 —— 它们已抽到远程控制卡片 header 作为独立重要指令。
 */
const GroupOrder = ['舱盖', '供电', '飞行器', '环境', '通信', '危险'];

/**
 * `action` 字段的取值预设。
 *
 * 后端只做区间校验（如空调 0~3、电池模式 1~2），并不描述每个值的业务含义 ——
 * 具体语义属于「面向人的文案」，放在前端逐项列出反而更好维护。
 * 未列出的 `action` 类指令（声光报警、电池保养）一律遵循 0 关 / 1 开。
 */
const ActionPresets: Record<string, { label: string; value: number }[]> = {
	air_conditioner_mode_switch: [
		{ label: '空闲模式（关闭制冷/制热/除湿）', value: 0 },
		{ label: '制冷模式', value: 1 },
		{ label: '制热模式', value: 2 },
		{ label: '除湿模式', value: 3 },
	],
	battery_store_mode_switch: [
		{ label: '计划模式（电量保持 55%~60%，寿命长）', value: 1 },
		{ label: '待命模式（电量保持 90%~95%，出勤快）', value: 2 },
	],
};
const SwitchPreset = [
	{ label: '关闭', value: 0 },
	{ label: '开启', value: 1 },
];

const loading = ref(false);
const actionLoading = ref(false);
const submitting = ref(false);
// 指令下发中（无参/有参共用）：防止用户误以为没执行而重复点击
const executing = ref(false);
// 正在切换中的开关 method（用于给对应 switch 显示 loading 圈）
const togglingMethod = ref<string>('');

const docks = ref<any[]>([]);
const dockSn = ref<string>('');
// 接口侧状态：只保留 store 里没有的字段（在线标记、告警数、在途指令、机型、市电电压、推杆等落库字段）
const state = ref<any>(null);
const actions = ref<any[]>([]);
const records = ref<any[]>([]);

/**
 * 当前选中机场的实时 OSD（来自 useDeviceStore，后台 MQTT 实时推送）。
 * 设备实时状态一律以这里为准 —— 及时性远高于接口轮询，且随推送自动刷新，无需手动/定时轮询。
 */
const osd = computed<DockOsd | undefined>(() => (dockSn.value ? deviceStore.dockOsds.get(dockSn.value) : undefined));

/* ------------------------------ 实时状态（来自 OSD 推送） ------------------------------ */

// 中文文案映射：前端 DockOsd 只带数值枚举，不带头部接口那样的中文名，这里补一份
const ModeNameMap: Record<number, string> = {
	[ModeCodeEnum.Idle]: '空闲',
	[ModeCodeEnum.OnsiteDebug]: '现场调试',
	[ModeCodeEnum.RemoteDebug]: '远程调试',
	[ModeCodeEnum.FirmwareUpgrading]: '固件升级中',
	[ModeCodeEnum.Working]: '工作中',
	[ModeCodeEnum.CalibrationPending]: '等待校准',
};
const CoverStateNameMap: Record<number, string> = { 0: '关闭', 1: '打开', 2: '半开', 3: '异常' };
const DroneInDockNameMap: Record<number, string> = { 0: '舱外', 1: '舱内' };
const BatteryStoreModeNameMap: Record<number, string> = { 1: '计划模式', 2: '待命模式' };
const SdrLinkWorkmodeNameMap: Record<number, string> = { 0: '仅 SDR', 1: '4G 增强' };
const AirConditionerStateNameMap: Record<number, string> = {
	0: '空闲',
	1: '制冷中',
	2: '制热中',
	3: '除湿中',
	4: '退出制冷',
	5: '退出制热',
	6: '退出除湿',
	7: '准备制冷',
	8: '准备制热',
	9: '准备除湿',
	10: '准备送风制冷',
	11: '送风制冷中',
	12: '退出送风制冷',
	13: '准备除霜',
	14: '除霜中',
	15: '退出除霜',
};
const FlighttaskStepNameMap: Record<number, string> = {
	0: '准备中',
	1: '飞行中',
	2: '回收中',
	3: '自定义区域更新中',
	4: '地形障碍物更新中',
	5: '空闲',
	255: '飞行器异常',
	256: '未知',
};

const osdModeCode = computed(() => osd.value?.modeCode);
const osdIsIdle = computed(() => osdModeCode.value === ModeCodeEnum.Idle);
const osdModeName = computed(() => (osdModeCode.value != null ? ModeNameMap[osdModeCode.value] : undefined));
const osdFlighttaskStepName = computed(() => {
	const code = osd.value?.flighttaskStepCode;
	return code != null ? FlighttaskStepNameMap[code] : undefined;
});
const osdCoverStateName = computed(() => {
	const v = osd.value?.coverState;
	return v != null ? CoverStateNameMap[v] : undefined;
});
const osdDroneInDockName = computed(() => {
	const v = osd.value?.droneInDock;
	return v != null ? DroneInDockNameMap[v] : undefined;
});
const osdBatteryStoreModeName = computed(() => {
	const v = osd.value?.batteryStoreMode;
	return v != null ? BatteryStoreModeNameMap[v] : undefined;
});
const osdSdrLinkWorkmodeName = computed(() => {
	const v = osd.value?.wirelessLink?.linkWorkmode;
	return v != null ? SdrLinkWorkmodeNameMap[v] : undefined;
});

const paramVisible = ref(false);
const rtkVisible = ref(false);
const current = ref<any>(null);
const form = ref<any>({});

onMounted(async () => {
	await loadDocks();
	// 只有一台机场时直接选中，省掉一次多余的交互
	if (!dockSn.value && docks.value.length === 1) dockSn.value = docks.value[0].sn;
	if (dockSn.value) await loadAll();
});

/* ------------------------------ 数据加载 ------------------------------ */

async function loadDocks() {
	try {
		const res = await dockOptionsDjiDock();
		docks.value = res.data.result ?? [];
	} catch {
		docks.value = [];
	}
}

async function loadAll() {
	if (!dockSn.value) return;
	loading.value = true;
	actionLoading.value = true;
	try {
		await Promise.all([loadState(), loadActions(), loadRecords()]);
	} finally {
		loading.value = false;
		actionLoading.value = false;
	}
}

async function loadState() {
	try {
		const res = await stateDjiDock(dockSn.value);
		state.value = res.data.result ?? null;
	} catch {
		state.value = null;
	}
}

async function loadActions() {
	try {
		const res = await actionsDjiDock(dockSn.value);
		actions.value = res.data.result ?? [];
	} catch {
		actions.value = [];
	}
}

async function loadRecords() {
	try {
		const res = await recentDjiDock(dockSn.value, 30);
		records.value = res.data.result ?? [];
	} catch {
		records.value = [];
	}
}

function handleDockChange() {
	state.value = null;
	actions.value = [];
	records.value = [];
	loadAll();
}

/* ------------------------------ 指令分组 ------------------------------ */

/**
 * 维护组（远程调试开关、一键标定）抽出来作为「重要指令」单独展示在卡片头部。
 * 后端按 group === '维护' 返回，这里过滤出来。
 */
const maintainActions = computed(() => actions.value.filter((act) => act.group === '维护'));

const actionGroups = computed(() => {
	const map = new Map<string, any[]>();
	for (const act of actions.value) {
		// 维护组已在卡片头部单独展示，这里跳过，避免重复渲染
		if (act.group === '维护') continue;
		if (!map.has(act.group)) map.set(act.group, []);
		map.get(act.group)!.push(act);
	}
	return (
		[...map.entries()]
			.map(([name, list]) => ({
				name,
				order: GroupOrder.indexOf(name),
				actions: list,
			}))
			// 后端没覆盖到的新分组会拿到 -1，排到末尾而不是丢掉 ——宁可多看一组，也不要悄悄隐藏功能
			.sort((a, b) => (a.order < 0 ? 1 : b.order < 0 ? -1 : a.order - b.order))
	);
});

function buttonType(act: any) {
	if (act.riskLevel === Risk.Dangerous) return 'danger';
	if (act.riskLevel === Risk.Caution) return 'warning';
	return 'primary';
}

const actionPreset = computed(() => ActionPresets[current.value?.method] ?? SwitchPreset);

function hasField(name: string) {
	return (current.value?.requiredFields ?? []).includes(name);
}

/* ------------------------------ 指令下发 ------------------------------ */

/**
 * 开关当前「开/关」状态，由实时 OSD 判定（而非后端 actions 接口的静态快照）。
 *
 * 以开关的「开」method 为键，映射到 OSD 字段；返回：
 * - true/false：明确的开关态
 * - null：该开关没有对应 OSD 字段（如电池保养）或 OSD 尚未上报 → 前端置灰
 */
function toggleCurrentOn(act: any): boolean | null {
	const o = osd.value;
	if (!o) return null;
	switch (act.toggle?.onMethod) {
		case 'cover_open':
			return o.coverState === 1;
		case 'charge_open':
			return o.droneChargeState?.state === 1;
		case 'supplement_light_open':
			return o.supplementLightState === 1;
		case 'alarm_state_switch':
			return o.alarmState === 1;
		case 'sdr_workmode_switch':
			return o.wirelessLink?.linkWorkmode === 1;
		case 'debug_mode_open':
			return o.modeCode === ModeCodeEnum.RemoteDebug;
		default:
			// 电池保养等无 OSD 回读的开关：状态未知，切换后以回包为准
			return null;
	}
}

/**
 * 开关切换入口。
 *
 * 与按钮不同，开关的 `currentOn` 由 OSD 实时回读驱动，用户拨到哪个方向就发哪个 method：
 * - 拨到「开」→ 发 toggle.onMethod
 * - 拨到「关」→ 发 toggle.offMethod
 * 带参开关（声光报警/电池保养/增强图传）按 toggle.payloadField + on/offValue 组装 payload。
 */
async function handleToggle(act: any, val: boolean) {
	if (executing.value) return;

	const t = act.toggle;
	if (!t) return;
	// 状态未知（OSD 未上报）时不应触发，但 el-switch 已禁用，这里再兜底一次
	if (toggleCurrentOn(act) == null) return;

	const method = val ? t.onMethod : t.offMethod;
	const needConfirm = act.needConfirm && val; // 高危动作：仅「开启」这一侧需要确认（关闭通常是安全方向）

	if (needConfirm) {
		await ElMessageBox.confirm(`确定要对【${state.value?.dockNick || dockSn.value}】执行「${act.name}」的${val ? '开启' : '关闭'}吗？该操作属于「${act.riskName}」级别。`, '下发确认', {
			type: act.riskLevel === Risk.Dangerous ? 'error' : 'warning',
			confirmButtonText: '确认下发',
			cancelButtonText: '取消',
		});
	}

	const payload: any = { dockSn: dockSn.value, method, confirm: true };
	// 带参开关：按 toggle 描述组装参数
	if (t.payloadField) payload[t.payloadField] = val ? t.onValue : t.offValue;

	togglingMethod.value = method;
	try {
		await executeDjiDock(payload);
		ElMessage.success('指令已下发');
		// OSD 由后台 MQTT 实时推送，开关状态会随下一次上报自动翻转，无需手动回读；
		// 这里只刷新「操作日志 / 在途指令 / 可用性」等接口侧数据。
		await loadRecords();
		await loadActions();
	} catch {
		await loadRecords();
	} finally {
		togglingMethod.value = '';
	}
}

/** 某个开关是否正在切换（用于 el-switch 的 loading 圈） */
function switchLoading(act: any) {
	if (!act.toggle) return false;
	return togglingMethod.value === act.toggle.onMethod || togglingMethod.value === act.toggle.offMethod;
}

async function handleAction(act: any) {
	if (!act.available || executing.value) return;

	current.value = act;
	form.value = {
		action: actionPreset.value[0]?.value,
		linkWorkmode: 0,
		imei: '',
		deviceType: 'dock',
		simSlot: 1,
		esimOperator: 1,
		// 默认带出机场自身坐标：实际标定点通常就在机场附近，
		// 让人从零填三个浮点数是没必要的心智负担，但必须提示他这是预填值
		longitude: osd.value?.longitude ?? 0,
		latitude: osd.value?.latitude ?? 0,
		height: 0,
	};

	if (act.api === 'RtkCalibration') {
		rtkVisible.value = true;
		return;
	}

	if ((act.requiredFields ?? []).length > 0) {
		paramVisible.value = true;
		return;
	}

	await confirmAndExecute(act);
}

/**
 * 无参指令的执行路径。
 *
 * 高危指令在这里弹确认框、由人显式点「确认下发」，服务端还会再校验一次 confirm 标记 ——
 * 两道闸的意义不同：前端这道防止手滑，服务端那道防止被绕过接口直接调用。
 */
async function confirmAndExecute(act: any) {
	if (act.needConfirm) {
		await ElMessageBox.confirm(`确定要对【${state.value?.dockNick || dockSn.value}】执行「${act.name}」吗？该操作属于「${act.riskName}」级别。`, '下发确认', {
			type: act.riskLevel === Risk.Dangerous ? 'error' : 'warning',
			confirmButtonText: '确认下发',
			cancelButtonText: '取消',
		});
	}

	await dispatch({ dockSn: dockSn.value, method: act.method, confirm: true });
}

async function submitAction() {
	const act = current.value;
	if (!act) return;

	submitting.value = true;
	try {
		if (act.api === 'RtkCalibration') {
			await rtkCalibrationDjiDock({
				dockSn: dockSn.value,
				longitude: form.value.longitude,
				latitude: form.value.latitude,
				height: form.value.height,
				confirm: true,
			});
		} else {
			const payload: any = { dockSn: dockSn.value, method: act.method, confirm: true };
			if (hasField('action')) payload.action = form.value.action;
			if (hasField('linkWorkmode')) payload.linkWorkmode = form.value.linkWorkmode;
			if (hasField('imei')) payload.imei = form.value.imei;
			if (hasField('deviceType')) payload.deviceType = form.value.deviceType;
			if (hasField('simSlot')) payload.simSlot = form.value.simSlot;
			if (hasField('esimOperator')) payload.esimOperator = form.value.esimOperator;
			await executeDjiDock(payload);
		}

		ElMessage.success('指令已下发');
		paramVisible.value = false;
		rtkVisible.value = false;
		await loadAll();
	} finally {
		submitting.value = false;
	}
}

async function dispatch(payload: any) {
	executing.value = true;
	try {
		await executeDjiDock(payload);
		ElMessage.success('指令已下发');
		await loadAll();
	} catch {
		// 请求拦截器已提示错误；**记录仍然会落库** —— 被拒绝的操作同样需要留痕
		await loadRecords();
	} finally {
		executing.value = false;
	}
}

/**
 * 清除所有在途指令（收口为「取消」）。
 *
 * 用于解除「该指令正在执行中」的按钮互斥：指令回包成功但设备一直不推进度时会卡死，
 * 让同类指令一直点不动。清一次即可让按钮恢复可点。
 */
async function handleClearRunning() {
	if (!dockSn.value) return;
	const count = state.value?.runningCommands?.length ?? 0;
	if (count === 0) return;

	await ElMessageBox.confirm(`确定要清除该机场当前 ${count} 条在途指令吗？清除后这些指令会被标记为「取消」，按钮互斥随之解除。`, '清除所有指令', {
		type: 'warning',
		confirmButtonText: '清除',
		cancelButtonText: '取消',
	});

	try {
		const res = await clearRunningDjiDock(dockSn.value);
		const cleared = res?.data?.result ?? count;
		ElMessage.success(`已清除 ${cleared} 条在途指令`);
		await loadAll();
	} catch {
		// 拦截器已提示
	}
}

/* ------------------------------ 展示辅助 ------------------------------ */

function formatDateTime(value?: string) {
	if (!value) return '';
	return formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS');
}

function formatCoord(lng?: number, lat?: number) {
	if (lng == null || lat == null) return '-';
	return `${lng.toFixed(7)}, ${lat.toFixed(7)}`;
}

function formatTemp(value?: number) {
	return value == null ? '-' : `${value.toFixed(1)} ℃`;
}

function formatHumidity(value?: number) {
	return value == null ? '-' : `${value.toFixed(0)} %RH`;
}

function formatSpeed(value?: number) {
	return value == null ? '-' : `${value.toFixed(1)} m/s`;
}

const rainfallText = computed(() => {
	const map = ['无雨', '小雨', '中雨', '大雨'];
	const code = osd.value?.rainfall;
	return code == null ? '-' : (map[code] ?? `等级 ${code}`);
});

const storageText = computed(() => {
	const total = osd.value?.storage?.total;
	const used = osd.value?.storage?.used;
	// 单位 KB（物模型原始单位），转成 GB 更贴近人的直觉
	if (total == null) return '-';
	const usedGb = ((used ?? 0) / 1024 / 1024).toFixed(2);
	const totalGb = (total / 1024 / 1024).toFixed(2);
	return `${usedGb} / ${totalGb} GB`;
});

function formatAccTime(seconds?: number) {
	if (seconds == null) return '-';
	const hours = Math.floor(seconds / 3600);
	return hours >= 1 ? `${hours} 小时` : `${Math.floor(seconds / 60)} 分钟`;
}

function riskTagType(level: number) {
	if (level === Risk.Dangerous) return 'danger';
	if (level === Risk.Caution) return 'warning';
	return 'info';
}

/** 与后端 DockTaskStatusEnum 对应；2 成功、3 失败、4 取消、6 拒绝、7 超时 */
function statusTagType(status: number) {
	if (status === 2) return 'success';
	if (status === 3 || status === 6 || status === 7) return 'danger';
	if (status === 4) return 'info';
	return 'warning';
}
</script>
