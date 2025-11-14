import { Message } from '../message';
import { MessageHandler } from '../msgHandle';
import { useStoreDevice } from '/@/stores/device';

export class DroneOsdHandler implements MessageHandler<DroneOsd, 'droneOsd'> {
	handle(message: Message<DroneOsd, 'droneOsd'>): void {
		useStoreDevice().addDroneOsd(message.gateway, message.data);
	}
}

/**
 * 飞行器物模型根对象
 */
export interface DroneOsd extends BaseModel {
	sn: string;
	/**
	 * 蛙跳任务场景下，当飞行器对频了两个机场后，推送连接最好的机场SN
	 */
	bestLinkGateway: string;

	/**
	 * 图传连接拓扑
	 */
	wirelessLinkTopo: WirelessLinkTopo;

	/**
	 * 飞行器相机信息
	 */
	cameras: Array<CameraInfo>;

	/**
	 * 飞行安全数据库版本
	 */
	flysafeDatabaseVersion: string;

	/**
	 * 当离线地图关闭后，离线地图同步不再进行自动同步
	 */
	offlineMapEnable: boolean;

	/**
	 * 4G Dongle信息
	 */
	dongleInfos: Array<DongleInfo>;

	/**
	 * 大疆机场当前实际使用的返航高度模式
	 */
	currentRthMode: RthModeEnum;

	/**
	 * 智能返航模式下，飞行器将自动规划最佳返航高度。
	 * 大疆机场当前不支持设置返航高度模式，只能选择'设定高度'模式。
	 * 当环境，光线不满足视觉系统要求时（譬如傍晚阳光直射、夜间弱光无光），
	 * 飞行器将使用您设定的返航高度进行直线返航
	 */
	rthMode: RthModeEnum;

	/**
	 * 飞行器避障状态
	 */
	obstacleAvoidance: ObstacleAvoidance;

	/**
	 * 是否接近限飞区
	 */
	isNearAreaLimit: NearLimitStateEnum;

	/**
	 * 是否接近设定的限制高度
	 */
	isNearHeightLimit: NearLimitStateEnum;

	/**
	 * 飞行器限高（单位：米 / m）
	 */
	heightLimit: number;

	/**
	 * 飞行器夜航灯状态
	 */
	nightLightsState: NightLightStateEnum;

	/**
	 * 飞行器激活时间(unix 时间戳)（单位：秒 / s）
	 */
	activationTime: number;

	/**
	 * 保养信息
	 */
	maintainStatus: MaintainStatus;

	/**
	 * 飞行器累计飞行总架次
	 */
	totalFlightSorties: number;

	/**
	 * 负载编号（与字段 payload_index 保持一致）
	 */
	typeSubtypeGimbalindex: PayloadGimbalInfo;

	/**
	 * 航迹 ID
	 */
	trackId: string;

	/**
	 * 搜星状态
	 */
	positionState: PositionState;

	/**
	 * 存储容量（单位：KB）
	 */
	storage: StorageInfo;

	/**
	 * 飞行器电池信息
	 */
	battery: BatteryInfo;

	/**
	 * 飞行器累计飞行总里程（单位：米 / m）
	 */
	totalFlightDistance: number;

	/**
	 * 飞行器累计飞行航时（单位：秒 / s）
	 */
	totalFlightTime: number;

	/**
	 * 用户设置的电池严重低电量告警百分比
	 */
	seriousLowBatteryWarningThreshold: number;

	/**
	 * 用户设置的电池低电量告警百分比
	 */
	lowBatteryWarningThreshold: number;

	/**
	 * 可以为设备，也可以为某个浏览器。设备使用 A/B 表示 A 控，B 控，浏览器以自生成的 uuid 作为标识符
	 */
	controlSource: string;

	/**
	 * 当前风向
	 */
	windDirection: WindDirectionEnum;

	/**
	 * 风速估计，该风速是通过飞行器姿态推测出的，有一定的误差，仅供参考，不能作为气象数据使用（单位：0.1 米每秒 / m/s）
	 */
	windSpeed: number;

	/**
	 * 距离 Home 点的距离
	 */
	homeDistance: number;

	/**
	 * Home 点纬度
	 */
	homeLatitude: number;

	/**
	 * Home 点经度
	 */
	homeLongitude: number;

	/**
	 * 偏航轴角度与真北角（经线）的角度，0到6点钟方向为正值，6到12点钟方向为负值
	 */
	attitudeHead: number;

	/**
	 * 横滚轴角度
	 */
	attitudeRoll: number;

	/**
	 * 俯仰轴角度
	 */
	attitudePitch: number;

	/**
	 * 相对起飞点高度
	 */
	elevation: number;

	/**
	 * 相对地球椭球面高度, 计算：相对起飞点的高度 + 起飞点的椭球高
	 */
	height: number;

	/**
	 * 当前位置纬度
	 */
	latitude: number;

	/**
	 * 当前位置经度
	 */
	longitude: number;

	/**
	 * 垂直速度（单位：米每秒 / m/s）
	 */
	verticalSpeed: number;

	/**
	 * 水平速度
	 */
	horizontalSpeed: number;

	/**
	 * 固件升级状态
	 */
	firmwareUpgradeStatus: FirmwareUpgradeStatusEnum;

	/**
	 * 一致性升级：指飞行器某些模块的固件版本与系统匹配版本不一致，需要进行升级。
	 * 常见的情况例如：飞行器与遥控器已经升级至最新版本，但替换电池时发现电池未升级，此时一致性升级将被提示。
	 * 普通升级：开发者将飞行器所有模块升级至指定固件版本。
	 */
	compatibleStatus: CompatibleStatusEnum;

	/**
	 * 固件版本
	 */
	firmwareVersion: string;

	/**
	 * 档位
	 */
	gear: GearModeEnum;

	/**
	 * 飞行器进入当前状态的原因
	 */
	commanderFlightHeight: number;

	/**
	 * 指点飞行模式设置值
	 */
	commanderFlightMode: CommanderFlightModeEnum;

	/**
	 * 执行指点飞行时失控了，选择继续执行完，还是执行普通失控行为
	 */
	commanderModeLostAction: CommanderModeLostActionEnum;

	/**
	 * 用户对相机拍摄的照片和录像文件进行水印配置, 目前暂不支持直播画面水印
	 */
	cameraWatermarkSettings: CameraWatermarkSettings;

	/**
	 * 机场选址指飞行器在空中悬停，为机场选址以及检查 RTK 信号质量
	 */
	modeCode: FlightModeEnum;

	/**
	 * 飞行器限远状态
	 */
	distanceLimitStatus: DistanceLimitStatus;

	/**
	 * psdk ui 资源包
	 */
	psdkUiResource: Array<PsdkUiResourceItem>;

	/**
	 * psdk 负载设备属性值
	 */
	psdkWidgetValues: Array<PsdkWidgetValue>;
}

// =============== Enums ===============

enum RthModeEnum {
	Smart = 0,
	Fixed = 1,
}

enum NearLimitStateEnum {
	NotReached = 0,
	Approaching = 1,
}

enum NightLightStateEnum {
	Off = 0,
	On = 1,
}

enum WindDirectionEnum {
	North = 1,
	Northeast = 2,
	East = 3,
	Southeast = 4,
	South = 5,
	Southwest = 6,
	West = 7,
	Northwest = 8,
}

enum FirmwareUpgradeStatusEnum {
	NotUpgrading = 0,
	Upgrading = 1,
}

enum CompatibleStatusEnum {
	NoUpgradeNeeded = 0,
	UpgradeNeeded = 1,
}

enum GearModeEnum {
	A = 0,
	P = 1,
	NAV = 2,
	FPV = 3,
	FARM = 4,
	S = 5,
	F = 6,
	M = 7,
	G = 8,
	T = 9,
}

enum CommanderFlightModeEnum {
	SmartHeight = 0,
	FixedHeight = 1,
}

enum CommanderModeLostActionEnum {
	ContinueTask = 0,
	ExitToNormal = 1,
}

enum FlightModeEnum {
	Standby = 0,
	TakeoffPreparing = 1,
	TakeoffReady = 2,
	ManualFlying = 3,
	AutoTakeoff = 4,
	WaypointFlying = 5,
	Panorama = 6,
	FollowMe = 7,
	AdsbAvoid = 8,
	AutoRTH = 9,
	AutoLanding = 10,
	ForcedLanding = 11,
	ThreePropLanding = 12,
	Upgrading = 13,
	Disconnected = 14,
	APAS = 15,
	VirtualJoystick = 16,
	CommandFlying = 17,
	RTKConverging = 18,
	DockSiteSelection = 19,
}

// =============== Structs ===============

interface WirelessLinkTopo {
	secretCode: number[]; // size: 28, item_type: int
	centerNode: SdrNode;
	leafNodes: Array<SdrNode>;
}

interface SdrNode {
	sdrId: number;
	sn: string;
	controlSourceIndex?: number; // min:1, max:2
}

interface CameraInfo {
	remainPhotoNum: number;
	remainRecordDuration: number; // seconds
	recordTime: number; // seconds
	payloadIndex: string; // {type-subtype-gimbalindex}
	cameraMode: CameraModeEnum;
	photoState: PhotoStateEnum;
	screenSplitEnable: boolean;
	recordingState: RecordingStateEnum;
	zoomFactor: number;
	irZoomFactor: number;
	liveviewWorldRegion: LiveviewRegion;
	photoStorageSettings: Array<'current' | 'vision' | 'ir'>;
	videoStorageSettings: Array<'current' | 'vision' | 'ir'>;
	wideExposureMode: ExposureModeEnum;
	wideIso: IsoEnum;
	wideShutterSpeed: ShutterSpeedEnum;
	wideExposureValue: ExposureValueEnum;
	zoomExposureMode: ExposureModeEnum;
	zoomIso: IsoEnum;
	zoomShutterSpeed: ShutterSpeedEnum;
	zoomExposureValue: ExposureValueEnum;
	zoomFocusMode: FocusModeEnum;
	zoomFocusValue: number;
	zoomMaxFocusValue: number;
	zoomMinFocusValue: number;
	zoomCalibrateFarthestFocusValue: number;
	zoomCalibrateNearestFocusValue: number;
	zoomFocusState: FocusStateEnum;
	irMeteringMode: IrMeteringModeEnum;
	irMeteringPoint?: IrMeteringPoint;
	irMeteringArea?: IrMeteringArea;
}

enum CameraModeEnum {
	Photo = 0,
	Video = 1,
	LowLight = 2,
	Panorama = 3,
}

enum PhotoStateEnum {
	Idle = 0,
	Taking = 1,
}

enum RecordingStateEnum {
	Idle = 0,
	Recording = 1,
}

enum ExposureModeEnum {
	Auto = 1,
	ShutterPriority = 2,
	AperturePriority = 3,
	Manual = 4,
}

enum IsoEnum {
	Auto = 0,
	AutoHighSense = 1,
	ISO50 = 2,
	ISO100 = 3,
	ISO200 = 4,
	ISO400 = 5,
	ISO800 = 6,
	ISO1600 = 7,
	ISO3200 = 8,
	ISO6400 = 9,
	ISO12800 = 10,
	ISO25600 = 11,
	Fixed = 255,
}

enum ShutterSpeedEnum {
	_1_8000 = 0,
	_1_6400 = 1,
	_1_6000 = 2,
	_1_5000 = 3,
	_1_4000 = 4,
	_1_3200 = 5,
	_1_3000 = 6,
	_1_2500 = 7,
	_1_2000 = 8,
	_1_1600 = 9,
	_1_1500 = 10,
	_1_1250 = 11,
	_1_1000 = 12,
	_1_800 = 13,
	_1_725 = 14,
	_1_640 = 15,
	_1_500 = 16,
	_1_400 = 17,
	_1_350 = 18,
	_1_320 = 19,
	_1_250 = 20,
	_1_240 = 21,
	_1_200 = 22,
	_1_180 = 23,
	_1_160 = 24,
	_1_125 = 25,
	_1_120 = 26,
	_1_100 = 27,
	_1_90 = 28,
	_1_80 = 29,
	_1_60 = 30,
	_1_50 = 31,
	_1_40 = 32,
	_1_30 = 33,
	_1_25 = 34,
	_1_20 = 35,
	_1_15 = 36,
	_1_12_5 = 37,
	_1_10 = 38,
	_1_8 = 39,
	_1_6_25 = 40,
	_1_5 = 41,
	_1_4 = 42,
	_1_3 = 43,
	_1_2_5 = 44,
	_1_2 = 45,
	_1_1_67 = 46,
	_1_1_25 = 47,
	_1_0 = 48,
	_1_3s = 49,
	_1_6s = 50,
	_2_0s = 51,
	_2_5s = 52,
	_3_0s = 53,
	_3_2s = 54,
	_4_0s = 55,
	_5_0s = 56,
	_6_0s = 57,
	_7_0s = 58,
	_8_0s = 59,
	Auto = 65534,
}

enum ExposureValueEnum {
	EV_N5_0 = 1,
	EV_N4_7 = 2,
	EV_N4_3 = 3,
	EV_N4_0 = 4,
	EV_N3_7 = 5,
	EV_N3_3 = 6,
	EV_N3_0 = 7,
	EV_N2_7 = 8,
	EV_N2_3 = 9,
	EV_N2_0 = 10,
	EV_N1_7 = 11,
	EV_N1_3 = 12,
	EV_N1_0 = 13,
	EV_N0_7 = 14,
	EV_N0_3 = 15,
	EV_0 = 16,
	EV_P0_3 = 17,
	EV_P0_7 = 18,
	EV_P1_0 = 19,
	EV_P1_3 = 20,
	EV_P1_7 = 21,
	EV_P2_0 = 22,
	EV_P2_3 = 23,
	EV_P2_7 = 24,
	EV_P3_0 = 25,
	EV_P3_3 = 26,
	EV_P3_7 = 27,
	EV_P4_0 = 28,
	EV_P4_3 = 29,
	EV_P4_7 = 30,
	EV_P5_0 = 31,
	Fixed = 255,
}

enum FocusModeEnum {
	MF = 0,
	AFS = 1,
	AFC = 2,
}

enum FocusStateEnum {
	Idle = 0,
	Focusing = 1,
	Success = 2,
	Failed = 3,
}

enum IrMeteringModeEnum {
	Off = 0,
	Point = 1,
	Area = 2,
}

interface LiveviewRegion {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

interface IrMeteringPoint {
	x: number; // 0~1
	y: number; // 0~1
	temperature: number;
}

interface IrMeteringArea {
	x: number; // 0~1
	y: number; // 0~1
	width: number; // 0~1
	height: number; // 0~1
	averTemperature: number;
	minTemperaturePoint: TemperaturePoint;
	maxTemperaturePoint: TemperaturePoint;
}

interface TemperaturePoint {
	x: number;
	y: number;
	temperature: number;
}

interface DongleInfo {
	imei: string;
	dongleType: DongleTypeEnum;
	eid: string;
	esimActivateState: EsimActivateStateEnum;
	simCardState: SimCardStateEnum;
	simSlot: SimSlotEnum;
	esimInfos: Array<EsimInfo>;
	simInfo: SimInfo;
}

enum DongleTypeEnum {
	Old = 6,
	NewWithEsims = 10,
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
	telecomOperator: TelecomOperatorEnum;
	enabled: boolean;
	iccid: string;
}

interface SimInfo {
	telecomOperator: TelecomOperatorEnum;
	simType: SimTypeEnum;
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
	Normal = 1,
	TriNetwork = 2,
}

interface ObstacleAvoidance {
	horizon: ObstacleStateEnum;
	upside: ObstacleStateEnum;
	downside: ObstacleStateEnum;
}

enum ObstacleStateEnum {
	Off = 0,
	On = 1,
}

interface MaintainStatus {
	maintainStatusArray: Array<MaintainStatusItem>;
}

interface MaintainStatusItem {
	state: MaintenanceStateEnum;
	lastMaintainType: LastMaintainTypeEnum;
	lastMaintainTime: number; // unix timestamp
	lastMaintainFlightTime: number; // hours
	lastMaintainFlightSorties: number;
}

enum MaintenanceStateEnum {
	None = 0,
	Exists = 1,
}

enum LastMaintainTypeEnum {
	Basic = 1,
	Routine = 2,
	Deep = 3,
}

interface PayloadGimbalInfo {
	gimbalPitch: number; // degree
	gimbalRoll: number; // degree
	gimbalYaw: number; // degree
	payloadIndex: string;
	zoomFactor: number;
	thermalCurrentPaletteStyle: ThermalPaletteStyleEnum;
	thermalSupportedPaletteStyles: Array<ThermalPaletteStyleEnum>;
	thermalGainMode: ThermalGainModeEnum;
	thermalIsothermState: ThermalIsothermStateEnum;
	thermalIsothermUpperLimit: number; // °C
	thermalIsothermLowerLimit: number; // °C
	thermalGlobalTemperatureMin: number; // °C
	thermalGlobalTemperatureMax: number; // °C
}

enum ThermalPaletteStyleEnum {
	WhiteHot = 0,
	BlackHot = 1,
	RedHot = 2,
	Medical = 3,
	Rainbow1 = 5,
	IronRed = 6,
	Arctic = 8,
	Lava = 11,
	HotIron = 12,
	Rainbow2 = 13,
}

enum ThermalGainModeEnum {
	Auto = 0,
	LowGain = 1, // 0°C-500°C
	HighGain = 2, // -20°C-150°C
}

enum ThermalIsothermStateEnum {
	Off = 0,
	On = 1,
}

interface PositionState {
	isFixed: ConvergenceStateEnum;
	quality: GpsQualityEnum;
	gpsNumber: number;
	rtkNumber: number;
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

interface StorageInfo {
	total: number; // KB
	used: number; // KB
}

interface BatteryInfo {
	capacityPercent: number; // 0-100
	remainFlightTime: number; // seconds
	returnHomePower: number; // %
	landingPower: number; // %
	batteries: Array<BatteryDetail>;
}

interface BatteryDetail {
	capacityPercent: number;
	index: number;
	sn: string;
	type: number;
	subType: number;
	firmwareVersion: string;
	loopTimes: number;
	voltage: number; // mV
	temperature: number; // °C, one decimal
	highVoltageStorageDays: number; // days
}

interface DistanceLimitStatus {
	state: DistanceLimitStateEnum;
	distanceLimit: number; // meters
	isNearDistanceLimit: NearLimitStateEnum;
}

enum DistanceLimitStateEnum {
	NotSet = 0,
	Set = 1,
}

interface PsdkUiResourceItem {
	psdkIndex: number;
	psdkReady: PsdkReadyStateEnum;
	objectKey: string;
}

enum PsdkReadyStateEnum {
	NotReady = 0,
	Ready = 1,
}

interface PsdkWidgetValue {
	psdkIndex: number;
	psdkName: string;
	psdkSn: string;
	psdkVersion: string;
	psdkLibVersion: string;
	speaker?: SpeakerInfo;
	values: Array<PsdkControlValue>;
}

interface SpeakerInfo {
	workMode: SpeakerWorkModeEnum;
	playMode: SpeakerPlayModeEnum;
	playVolume: number; // 0-100
	systemState: SpeakerSystemStateEnum;
	playFileName: string;
	playFileMd5: string;
}

enum SpeakerWorkModeEnum {
	TTS = 0,
	AudioPlayback = 1,
}

enum SpeakerPlayModeEnum {
	Once = 0,
	Loop = 1,
}

enum SpeakerSystemStateEnum {
	Idle = 0,
	Transferring = 1,
	Playing = 2,
	Error = 3,
	TTSTextConverting = 4,
	Downloading = 99,
}

interface PsdkControlValue {
	index: number;
	value: number;
}

interface CameraWatermarkSettings {
	globalEnable: WatermarkSwitchEnum;
	droneTypeEnable: WatermarkSwitchEnum;
	droneSnEnable: WatermarkSwitchEnum;
	datetimeEnable: WatermarkSwitchEnum;
	gpsEnable: WatermarkSwitchEnum;
	userCustomStringEnable: WatermarkSwitchEnum;
	userCustomString: string; // max 250 bytes
	layout: WatermarkLayoutEnum;
}

enum WatermarkSwitchEnum {
	Off = 0,
	On = 1,
}

enum WatermarkLayoutEnum {
	TopLeft = 0,
	BottomLeft = 1,
	TopRight = 2,
	BottomRight = 3,
}
