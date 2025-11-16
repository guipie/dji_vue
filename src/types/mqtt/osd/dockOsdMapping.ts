import { AirConditionerStateEnum, FlighttaskStepCodeEnum, ModeCodeEnum, RainfallEnum, RtkSourceTypeEnum } from './dockOsd';

const modeCodeEnumMapping: Record<ModeCodeEnum, EnumConfig> = {
	[ModeCodeEnum.Idle]: {
		label: '空闲',
		color: '#52c41a',
	},
	[ModeCodeEnum.OnsiteDebug]: {
		label: '现场调试',
		color: '#faad14',
	},
	[ModeCodeEnum.RemoteDebug]: {
		label: '远程调试',
		color: '#faad14',
	},
	[ModeCodeEnum.FirmwareUpgrading]: {
		label: '固件升级中',
		color: '#1890ff',
	},
	[ModeCodeEnum.Working]: {
		label: '工作中',
		color: '#52c41a',
	},
	[ModeCodeEnum.CalibrationPending]: {
		label: '等待校准',
		color: '#ff4d4f',
	},
};
export const renderModeCodeTag = (modeCodeValue: ModeCodeEnum): string => {
	// 处理未定义的枚举值
	const config = modeCodeEnumMapping[modeCodeValue] || {
		label: '未知状态',
		color: '#A30D0DFF',
	};
	return `<span style="
    color: ${config.color};
    padding: 4px 12px;
    margin: 0px 12px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: bold;
    display: inline-block;
    white-space: nowrap;
    border: 1px solid ${config.color}20;
  ">${config.label}</span>`;
};

// FlighttaskStepCodeEnum 映射配置
const flighttaskStepCodeEnumMapping: Record<FlighttaskStepCodeEnum, EnumConfig> = {
	[FlighttaskStepCodeEnum.Preparing]: {
		label: '准备中',
		color: '#1890ff',
	},
	[FlighttaskStepCodeEnum.Flying]: {
		label: '飞行中',
		color: '#52c41a',
	},
	[FlighttaskStepCodeEnum.PostRecovery]: {
		label: '回收中',
		color: '#faad14',
	},
	[FlighttaskStepCodeEnum.CustomZoneUpdating]: {
		label: '自定义区域更新中',
		color: '#722ed1',
	},
	[FlighttaskStepCodeEnum.TerrainObstacleUpdating]: {
		label: '地形障碍物更新中',
		color: '#722ed1',
	},
	[FlighttaskStepCodeEnum.Idle]: {
		label: '空闲',
		color: '#52c41a',
	},
	[FlighttaskStepCodeEnum.DroneAbnormal]: {
		label: '飞行器异常',
		color: '#ff4d4f',
	},
	[FlighttaskStepCodeEnum.Unknown]: {
		label: '未知',
		color: '#A30D0DFF',
	},
};

// FlighttaskStepCodeEnum 渲染函数
export const renderFlighttaskStepCodeTag = (flighttaskStepCodeValue: FlighttaskStepCodeEnum): string => {
	// 处理未定义的枚举值
	const config = flighttaskStepCodeEnumMapping[flighttaskStepCodeValue] || {
		label: '未知状态',
		color: '#A30D0DFF',
	};

	return `<span style="
    color: ${config.color};
    font-size: 16px;
    font-weight: bold;
    display: inline-block;
    white-space: nowrap;
  ">${config.label}</span>`;
};

// RtkSourceTypeEnum 映射配置
const rtkSourceTypeEnumMapping: Record<RtkSourceTypeEnum, EnumConfig> = {
	[RtkSourceTypeEnum.NotCalibrated]: {
		label: '未校准',
		color: '#A30D0DFF',
	},
	[RtkSourceTypeEnum.SelfConverged]: {
		label: '自收敛',
		color: '#52c41a',
	},
	[RtkSourceTypeEnum.Manual]: {
		label: '手动',
		color: '#faad14',
	},
	[RtkSourceTypeEnum.NetworkRtk]: {
		label: '网络RTK',
		color: '#1890ff',
	},
};

// RtkSourceTypeEnum 渲染函数
export const renderRtkSourceTypeTag = (rtkSourceTypeValue?: RtkSourceTypeEnum): string => {
	// 处理未定义的枚举值
	const config = rtkSourceTypeEnumMapping[rtkSourceTypeValue!] || {
		label: '未知来源',
		color: '#A30D0DFF',
	};

	return `<span style="
    color: ${config.color};
    font-size: 16px;
    font-weight: bold;
    display: inline-block;
    white-space: nowrap;
  ">${config.label}</span>`;
};
export const render01Tag = (val: number | boolean | undefined, val1: any, valOther: any, options?: { val1Color: string; otherColor: string }): string => {
	return `<span style="
    color: ${val == 1 ? options?.val1Color || '#52c41a' : options?.otherColor || '#A30D0DFF'};
    font-size: 16px;
    font-weight: bold;
    display: inline-block;
    white-space: nowrap;
  ">${val == 1 ? val1 : valOther}</span>`;
};

// AirConditionerStateEnum 映射配置
const airConditionerStateEnumMapping: Record<AirConditionerStateEnum, EnumConfig> = {
	[AirConditionerStateEnum.Idle]: {
		label: '空闲',
		color: '#52c41a',
	},
	[AirConditionerStateEnum.Cooling]: {
		label: '制冷中',
		color: '#1890ff',
	},
	[AirConditionerStateEnum.Heating]: {
		label: '制热中',
		color: '#faad14',
	},
	[AirConditionerStateEnum.Dehumidifying]: {
		label: '除湿中',
		color: '#52c41a',
	},
	[AirConditionerStateEnum.CoolingExiting]: {
		label: '退出制冷',
		color: '#722ed1',
	},
	[AirConditionerStateEnum.HeatingExiting]: {
		label: '退出制热',
		color: '#722ed1',
	},
	[AirConditionerStateEnum.DehumidifyingExiting]: {
		label: '退出除湿',
		color: '#722ed1',
	},
	[AirConditionerStateEnum.CoolingPreparing]: {
		label: '准备制冷',
		color: '#1890ff',
	},
	[AirConditionerStateEnum.HeatingPreparing]: {
		label: '准备制热',
		color: '#faad14',
	},
	[AirConditionerStateEnum.DehumidifyingPreparing]: {
		label: '准备除湿',
		color: '#52c41a',
	},
	[AirConditionerStateEnum.WindCoolingPreparing]: {
		label: '准备送风制冷',
		color: '#1890ff',
	},
	[AirConditionerStateEnum.WindCooling]: {
		label: '送风制冷中',
		color: '#1890ff',
	},
	[AirConditionerStateEnum.WindCoolingExiting]: {
		label: '退出送风制冷',
		color: '#722ed1',
	},
	[AirConditionerStateEnum.DefoggingPreparing]: {
		label: '准备除霜',
		color: '#f5222d',
	},
	[AirConditionerStateEnum.Defogging]: {
		label: '除霜中',
		color: '#f5222d',
	},
	[AirConditionerStateEnum.DefoggingExiting]: {
		label: '退出除霜',
		color: '#722ed1',
	},
};

// AirConditionerStateEnum 渲染函数
export const renderAirConditionerStateTag = (airConditionerStateValue?: AirConditionerStateEnum): string => {
	// 处理未定义的枚举值
	const config = airConditionerStateEnumMapping[airConditionerStateValue!] || {
		label: '未知状态',
		color: '#A30D0DFF',
	};

	return `<span style="
    color: ${config.color};
    font-size: 16px;
    font-weight: bold;
    display: inline-block;
    white-space: nowrap;
  ">${config.label}</span>`;
};

// RainfallEnum 映射配置
const rainfallEnumMapping: Record<RainfallEnum, EnumConfig> = {
	[RainfallEnum.NoRain]: {
		label: '无雨',
		color: '#00BFFF', // 使用天空蓝色表示无雨状态
	},
	[RainfallEnum.LightRain]: {
		label: '小雨',
		color: '#1E90FF', // 使用较为明亮的蓝色表示小雨
	},
	[RainfallEnum.ModerateRain]: {
		label: '中雨',
		color: '#6495ED', // 使用淡蓝色表示中雨
	},
	[RainfallEnum.HeavyRain]: {
		label: '大雨',
		color: '#4682B4', // 使用更深的蓝色表示大雨
	},
};

// RainfallEnum 渲染函数
export const renderRainfallTag = (rainfallValue: RainfallEnum): string => {
	// 处理未定义的枚举值
	const config = rainfallEnumMapping[rainfallValue] || {
		label: '未知状态',
		color: '#A30D0DFF',
	};

	return `<span style="
    color: ${config.color};
    font-size: 16px;
    font-weight: bold;
    display: inline-block;
    white-space: nowrap;
  ">${config.label}</span>`;
};
