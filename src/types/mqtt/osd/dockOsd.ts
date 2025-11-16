import { Message } from '../message';
import { MessageHandler } from '../msgHandle';
import { useStoreDevice } from '/@/stores/device';

export class DockOsdHandler implements MessageHandler<DockOsd, 'dockOsd'> {
	handle(message: Message<DockOsd, 'dockOsd'>): void {
		if (message.topic.includes(message.gateway)) useStoreDevice().addDockOsd(message.gateway, { ...message.data, ...{ nick: message.ext } });
	}
}
/**
 * 机场物模型根对象
 */
export interface DockOsd extends BaseModel {
	sn: string;
	nick: string;
	/**
	 * Home 点有效性
	 */
	homePositionIsValid: HomePositionIsValidEnum;

	/**
	 * 机场朝向角（单位：度 / °）
	 */
	heading: number;

	/**
	 * 机场 RTK 标定源
	 */
	rtcmInfo?: RtcmInfo;

	/**
	 * 图传连接拓扑
	 */
	wirelessLinkTopo: WirelessLinkTopo;

	/**
	 * 机场空调工作状态信息
	 */
	airConditioner?: AirConditioner;

	/**
	 * 用户在指令飞行过程中拍照的照片快速回传至云端
	 */
	airTransferEnable: boolean;

	/**
	 * 开启静音模式，意味着：
	 * 1. 风扇转速降低、空调制冷性能下降、炎热天气下作业间隔变长。
	 * 2. 蜂鸣器声音将关闭，开关舱盖时请注意周围安全。
	 * 3. 机场待机状态的白色指示灯关闭，其他运行状态的指示灯正常。
	 */
	silentMode: SilentModeEnum;

	/**
	 * 用户体验改善计划
	 */
	userExperienceImprovement: UserExperienceImprovementEnum;

	/**
	 * 4G Dongle信息
	 */
	dongleInfos: Array<DongleInfo>;

	/**
	 * 飞行器电池保养信息
	 */
	droneBatteryMaintenanceInfo: DroneBatteryMaintenanceInfo;

	/**
	 * 保养信息
	 */
	maintainStatus: MaintainStatus;

	/**
	 * 搜星状态
	 */
	positionState: PositionState;

	/**
	 * 紧急停止按钮状态
	 */
	emergencyStopState: EmergencyStopStateEnum;

	/**
	 * 飞行器充电状态
	 */
	droneChargeState?: DroneChargeState;

	/**
	 * 机场备用电池信息
	 */
	backupBattery: BackupBattery;

	/**
	 * 机场声光报警状态
	 */
	alarmState: AlarmStateEnum;

	/**
	 * 电池运行模式
	 * 计划模式适合规律作业场景，无任务时电池电量保持在55%~60%，电池寿命较长。
	 * 待命模式适合应急作业场景，无任务时电池电量保持在90%~95%，电池寿命较短。
	 */
	batteryStoreMode: BatteryStoreModeEnum;

	/**
	 * 机场激活时间(unix 时间戳)（单位：秒 / s）
	 */
	activationTime: number;

	/**
	 * 椭球高度（单位：米 / m）
	 */
	height: number;

	/**
	 * 备降点
	 */
	alternateLandPoint?: AlternateLandPoint;

	/**
	 * 固件一致性
	 * 一致性升级：指飞行器某些模块的固件版本与系统匹配版本不一致，需要进行升级。
	 * 常见的情况例如：飞行器与遥控器已经升级至最新版本，但替换电池时发现电池未升级，此时一致性升级将被提示。
	 * 普通升级：开发者将飞行器所有模块升级至指定固件版本。
	 */
	compatibleStatus: CompatibleStatusEnum;

	/**
	 * 机场累计运行时长（单位：秒 / s）
	 */
	accTime: number;

	/**
	 * 首次上电时间（单位：毫秒 / ms）
	 */
	firstPowerOn: number;

	/**
	 * 存储容量
	 */
	storage: Storage;

	/**
	 * 工作电流（单位：毫安 / mA）
	 */
	workingCurrent: number;

	/**
	 * 工作电压（单位：毫伏 / mV）
	 */
	workingVoltage: number;

	/**
	 * 舱内湿度（单位：相对湿度 / %RH）
	 */
	humidity: number;

	/**
	 * 舱内温度（单位：摄氏度 / °C）
	 */
	temperature: number;

	/**
	 * 环境温度（单位：摄氏度 / °C）
	 */
	environmentTemperature: number;

	/**
	 * 风速（单位：米每秒 / m/s）
	 */
	windSpeed: number;

	/**
	 * 降雨量
	 */
	rainfall: RainfallEnum;

	/**
	 * 网关设备直播能力
	 */
	liveCapacity: LiveCapacity;

	/**
	 * 网关当前整体直播状态推送
	 */
	liveStatus: Array<LiveStatusItem>;

	/**
	 * 图传链路
	 */
	wirelessLink: WirelessLink;

	/**
	 * 媒体文件上传细节
	 */
	mediaFileDetail: MediaFileDetail;

	/**
	 * 机场累计作业次数（单位：次 / count）
	 */
	jobNumber: number;

	/**
	 * 飞行器是否在舱 {"0":"舱外","1":"舱内"}
	 */
	droneInDock: number;

	/**
	 * 网络状态
	 */
	networkState?: NetworkState;

	/**
	 * 补光灯状态
	 */
	supplementLightState: SupplementLightStateEnum;

	/**
	 * 舱盖状态
	 */
	coverState: CoverStateEnum;

	/**
	 * 子设备状态
	 */
	subDevice: SubDevice;

	/**
	 * 机场任务状态
	 */
	flighttaskStepCode: FlighttaskStepCodeEnum;

	/**
	 * 机场状态
	 */
	modeCode: ModeCodeEnum;

	/**
	 * 固件升级状态
	 */
	firmwareUpgradeStatus: FirmwareUpgradeStatusEnum;

	/**
	 * 固件版本
	 */
	firmwareVersion: string;

	/**
	 * 纬度
	 */
	latitude: number;

	/**
	 * 网关设备的经度
	 */
	longitude: number;

	/**
	 * DRC 链路的状态
	 */
	drcState: DrcStateEnum;
}

// =============== Enums ===============

enum HomePositionIsValidEnum {
	Invalid = 0,
	Valid = 1,
}

enum SilentModeEnum {
	NonSilent = 0,
	Silent = 1,
}

enum UserExperienceImprovementEnum {
	Initial = 0,
	Rejected = 1,
	Accepted = 2,
}

enum EmergencyStopStateEnum {
	Off = 0,
	On = 1,
}

enum AlarmStateEnum {
	Off = 0,
	On = 1,
}

enum BatteryStoreModeEnum {
	Scheduled = 1,
	Standby = 2,
}

enum CompatibleStatusEnum {
	NoUpgradeNeeded = 0,
	UpgradeNeeded = 1,
}

export enum RainfallEnum {
	NoRain = 0,
	LightRain = 1,
	ModerateRain = 2,
	HeavyRain = 3,
}

enum SupplementLightStateEnum {
	Off = 0,
	On = 1,
}

enum CoverStateEnum {
	Closed = 0,
	Open = 1,
	HalfOpen = 2,
	Abnormal = 3,
}

export enum FlighttaskStepCodeEnum {
	Preparing = 0,
	Flying = 1,
	PostRecovery = 2,
	CustomZoneUpdating = 3,
	TerrainObstacleUpdating = 4,
	Idle = 5,
	DroneAbnormal = 255,
	Unknown = 256,
}

export enum ModeCodeEnum {
	Idle = 0,
	OnsiteDebug = 1,
	RemoteDebug = 2,
	FirmwareUpgrading = 3,
	Working = 4,
	CalibrationPending = 5,
}
enum FirmwareUpgradeStatusEnum {
	NotUpgrading = 0,
	Upgrading = 1,
}

enum DrcStateEnum {
	Disconnected = 0,
	Connecting = 1,
	Connected = 2,
}

// =============== Structs ===============

interface RtcmInfo {
	/** 网络 RTK 挂载点信息 */
	mountPoint: string;
	/** 网络端口信息 */
	port: string;
	/** 网络 host 信息 */
	host: string;
	/** 设备类型 */
	rtcmDeviceType: RtcmDeviceTypeEnum;
	/** 标定类型 */
	sourceType: RtkSourceTypeEnum;
}

enum RtcmDeviceTypeEnum {
	Dock = 1,
}

export enum RtkSourceTypeEnum {
	NotCalibrated = 0,
	SelfConverged = 1,
	Manual = 2,
	NetworkRtk = 3,
}

interface WirelessLinkTopo {
	/** 加密编码 */
	secretCode: number[]; // size: 28
	/** 飞行器对频信息 */
	centerNode: SdrNode;
	/** 机场或遥控器对频信息 */
	leafNodes: SdrNode[];
}

interface SdrNode {
	/** 扰码信息 */
	sdrId: number;
	/** 设备sn */
	sn: string;
	/** 控制源序号（单位：无 / ，范围：1-2） */
	controlSourceIndex?: number;
}

interface AirConditioner {
	/**
	 * 机场空调工作状态信息，空调仅存在一种工作模式
	 */
	airConditionerState: AirConditionerStateEnum;
	/**
	 * 空调状态顺序为准备模式切换到工作状模式、随后可操作后切换到退出模式、退出完成后切换到空闲模式，
	 * 因此本物模型表示进行某个指令操作后还需要多久可以切换至下一状态。
	 * 例如当前为空闲状态，开启制冷模式后将进入制冷准备模式，则本时间表示还需要多久可以进入制冷工作模式。以此类推
	 * （单位：秒 / s）
	 */
	switchTime: number;
}

export enum AirConditionerStateEnum {
	Idle = 0,
	Cooling = 1,
	Heating = 2,
	Dehumidifying = 3,
	CoolingExiting = 4,
	HeatingExiting = 5,
	DehumidifyingExiting = 6,
	CoolingPreparing = 7,
	HeatingPreparing = 8,
	DehumidifyingPreparing = 9,
	WindCoolingPreparing = 10,
	WindCooling = 11,
	WindCoolingExiting = 12,
	DefoggingPreparing = 13,
	Defogging = 14,
	DefoggingExiting = 15,
}

interface DongleInfo {
	/** Dongle 的唯一识别标志 */
	imei: string;
	/** Dongle 类型 */
	dongleType: DongleTypeEnum;
	/** eSIM 的唯一识别标志，用于公众号查询套餐、购买服务 */
	eid: string;
	/** 需要激活才能使用 */
	esimActivateState: EsimActivateStateEnum;
	/** Dongle 中实体 SIM 卡的插入状态 */
	simCardState: SimCardStateEnum;
	/** 标识 Dongle 当前正在使用的 SIM 卡槽 */
	simSlot: SimSlotEnum;
	/** eSIM 信息 */
	esimInfos: Array<EsimInfo>;
	/** 可插入 Dongle 的实体 SIM 卡信息 */
	simInfo: SimInfo;
}

enum DongleTypeEnum {
	OldDongle = 6,
	NewDongleWithEsims = 10,
}

enum EsimActivateStateEnum {
	Unknown = 0,
	NotActivated = 1,
	Activated = 2,
}

enum SimCardStateEnum {
	NotInserted = 0,
	Inserted = 1,
}

enum SimSlotEnum {
	Unknown = 0,
	PhysicalSim = 1,
	Esim = 2,
}

interface EsimInfo {
	/** eSIM 支持的运营商 */
	telecomOperator: TelecomOperatorEnum;
	/** 同时刻只能有一个 eSIM 是使能的 */
	enabled: boolean;
	/** SIM 卡的唯一识别标志，可以用于实体 SIM 卡的套餐购买 */
	iccid: string;
}

interface SimInfo {
	/** SIM 卡支持的运营商 */
	telecomOperator: TelecomOperatorEnum;
	/** 实体 SIM 卡的类型 */
	simType: SimTypeEnum;
	/** SIM 卡的唯一识别标志，可以用于实体 SIM 卡的套餐购买 */
	iccid: string;
}

enum TelecomOperatorEnum {
	Unknown = 0,
	ChinaMobile = 1,
	ChinaUnicom = 2,
	ChinaTelecom = 3,
}

enum SimTypeEnum {
	Unknown = 0,
	NormalSim = 1,
	TriNetworkSim = 2,
}

interface DroneBatteryMaintenanceInfo {
	maintenanceState: MaintenanceStateEnum;
	/** 电池保养剩余时间（单位：小时 / h），向下取整 */
	maintenanceTimeLeft: number;
	/** 当飞行器舱内关机时由本物模型上报机场连接飞行器的电池加热保温信息 */
	heatState: BatteryHeatStateEnum;
	/** 当飞行器舱内关机时由本物模型上报机场连接飞行器的电池信息，基本数据与飞行器物模型中电池信息基本保持一致 */
	batteries: Array<BatteryDetail>;
}

enum MaintenanceStateEnum {
	NoMaintenance = 0,
	Pending = 1,
	InProgress = 2,
}

enum BatteryHeatStateEnum {
	Off = 0,
	Heating = 1,
	Insulating = 2,
}

interface BatteryDetail {
	/** 保留小数点后一位，正常范围0-100，设备端获取不到数据的异常值为 32767 */
	capacityPercent: number;
	index: BatteryIndexEnum;
	/** 正常范围0-28000mV，设备端获取不到数据的异常值为32767（单位：毫伏 / mV） */
	voltage: number;
	/** 保留小数点后一位，正常范围-40-150°C，设备端获取不到数据的异常值为32767（单位：摄氏度 / °C） */
	temperature: number;
}

enum BatteryIndexEnum {
	Left = 0,
	Right = 1,
}

interface MaintainStatus {
	maintainStatusArray: Array<MaintainStatusItem>;
}

interface MaintainStatusItem {
	state: MaintenanceExistenceEnum;
	lastMaintainType: LastMaintainTypeEnum;
	/** 上一次保养时间（单位：秒 / s） */
	lastMaintainTime: number;
	lastMaintainWorkSorties: number;
}

enum MaintenanceExistenceEnum {
	None = 0,
	Exists = 1,
}

enum LastMaintainTypeEnum {
	None = 0,
	Routine = 17,
	Deep = 18,
}

interface PositionState {
	isCalibration: CalibrationStateEnum;
	isFixed: ConvergenceStateEnum;
	quality: GpsQualityEnum;
	gpsNumber: number;
	rtkNumber: number;
}

enum CalibrationStateEnum {
	NotCalibrated = 0,
	Calibrated = 1,
}

enum ConvergenceStateEnum {
	NotStarted = 0,
	Converging = 1,
	Success = 2,
	Failed = 3,
}

enum GpsQualityEnum {
	Level1 = 1,
	Level2 = 2,
	Level3 = 3,
	Level4 = 4,
	Level5 = 5,
	RtkFixed = 10,
}

interface DroneChargeState {
	/** 电量百分比（范围：0-100） */
	capacityPercent: number;
	state: ChargingStateEnum;
}

enum ChargingStateEnum {
	Idle = 0,
	Charging = 1,
}

interface BackupBattery {
	switch: BackupBatterySwitchEnum;
	/** 备用电池关闭时电压为0（单位：毫伏 / mV） */
	voltage: number;
	/** 保留小数点后一位（单位：摄氏度 / °C） */
	temperature: number;
}

enum BackupBatterySwitchEnum {
	Off = 0,
	On = 1,
}

interface AlternateLandPoint {
	longitude: number;
	latitude: number;
	/** 安全高度(备降转移高) */
	safeLandHeight: number;
	isConfigured: AlternateLandConfiguredEnum;
	height: number;
}

enum AlternateLandConfiguredEnum {
	NotSet = 0,
	Set = 1,
}

interface Storage {
	/** 总容量（单位：千字节 / KB） */
	total: number;
	/** 已使用容量（单位：千字节 / KB） */
	used: number;
}

interface LiveCapacity {
	availableVideoNumber: number;
	coexistVideoNumberMax: number;
	/** 可选择的视频设备源（设备层，比如飞行器） */
	deviceList: Array<VideoDevice>;
}

interface VideoDevice {
	/** 飞行器等视频源设备序列号（SN） */
	sn: string;
	availableVideoNumber: number;
	coexistVideoNumberMax: number;
	cameraList: Array<CameraInfo>;
}

interface CameraInfo {
	/** 使用 {type-subtype-gimbalindex} 的格式 */
	cameraIndex: string;
	availableVideoNumber: number;
	coexistVideoNumberMax: number;
	videoList: Array<VideoStream>;
}

interface VideoStream {
	videoIndex: string;
	videoType: string;
	switchableVideoTypes: string[];
}

interface LiveStatusItem {
	/**
	 * 某路在推视频码流的标识符，格式为 {sn}/{camera_index}/{video_index}。
	 * 其中 {sn} 为视频源设备序列号。
	 * {camera_index} 为相机索引，使用 {type-subtype-gimbalindex} 的格式。
	 * {video_index} 为该相机级别的视频源可以选择的码流索引。
	 */
	videoId: string;
	/** 表明视频镜头的类型，如normal/wide/zoom/infrared等 */
	videoType: string;
	videoQuality: VideoQualityEnum;
	status: LiveStatusEnum;
	errorStatus: number; // length: 6
}

enum VideoQualityEnum {
	Adaptive = 0,
	Smooth = 1,
	SD = 2,
	HD = 3,
	FHD = 4,
}

enum LiveStatusEnum {
	NotLive = 0,
	Live = 1,
}

interface WirelessLink {
	dongleNumber: number;
	'4gLinkState': LinkStateEnum;
	sdrLinkState: LinkStateEnum;
	linkWorkmode: LinkWorkModeEnum;
	sdrQuality: number; // 0-5
	'4gQuality': number; // 0-5
	'4gUavQuality': number; // 天端 4G 信号质量
	'4gGndQuality': number; // 地端 4G 信号质量
	sdrFreqBand: number;
	'4gFreqBand': number;
}

enum LinkStateEnum {
	Disconnected = 0,
	Connected = 1,
}

enum LinkWorkModeEnum {
	SdrOnly = 0,
	'4gFusion' = 1,
}

interface MediaFileDetail {
	remainUpload: number;
}

interface NetworkState {
	type: NetworkTypeEnum;
	quality: NetworkQualityEnum;
	rate: number; // KB/s
}

enum NetworkTypeEnum {
	'4g' = 1,
	Ethernet = 2,
}

enum NetworkQualityEnum {
	NoSignal = 0,
	Poor = 1,
	Fair = 2,
	Average = 3,
	Good = 4,
	Excellent = 5,
}

interface SubDevice {
	deviceSn: string;
	/** 格式为 {domain-type-subtype} */
	deviceModelKey: string;
	/** 机场停机坪上的飞行器开机状态 */
	deviceOnlineStatus: DeviceOnlineStatusEnum;
	/** 机场停机坪上的飞行器是否与机场对频 */
	devicePaired: DevicePairedEnum;
}

enum DeviceOnlineStatusEnum {
	Off = 0,
	On = 1,
}

enum DevicePairedEnum {
	NotPaired = 0,
	Paired = 1,
}
