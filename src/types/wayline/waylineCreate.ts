import { TemplateTypeEnum } from './waylineEnus';
export interface WaylineCreateExt {
	waylinePointHeightMode: 'hb' | 'xdqfd' | 'xddm'; //（EGM96海拔高度/相对起飞点高度/AGL相对地面高度）
	orientedPhotoMode: 'normalPhoto' | 'lowLightSmartShooting';
	homeCoordinate?: { longitude: number; latitude: number; height?: number };
}
export interface WaylineCreateParams {
	waylineName: string;
	templateType: TemplateTypeEnum;
	templateStr: string;
	droneModel: string;
	acc?: string;
	missionConfig: MissionConfig;
	folder: Folder;
}

export interface MissionConfig {
	flyToWaylineMode: 'safely' | 'pointToPoint'; //飞向首航点模式  垂直爬升(安全模式)  or 倾斜爬升
	takeOffSecurityHeight: number; //安全起飞高度
	takeOffRefPointAGLHeight: number; //* 注：”参考起飞点“海拔高度，与“参考起飞点”中的椭球高度对应
	globalTransitionalSpeed: number; //[1,15]全局航线过渡速度,* 注：飞行器飞往每条航线首航点的速度。航线任务中断时，飞行器从当前位置恢复至断点的速度。
	finishAction: 'goHome' | 'noAction' | 'autoLand' | 'gotoFirstWaypoint';
	autoRerouteInfoVal: boolean;
}

export interface Folder {
	//全局航线飞行速度	[1,15] * 注：该元素定义了此模板生成的整段航线中，飞行器的目标飞行速度。如果额外定义了某航点的该元素，则局部定义会覆盖全局定义。
	autoFlightSpeed: number;
	//全局航点类型（全局航点转弯模式）
	// coordinateTurn：协调转弯，不过点，提前转弯
	// toPointAndStopWithDiscontinuityCurvature：直线飞行，飞行器到点停
	// toPointAndStopWithContinuityCurvature：曲线飞行，飞行器到点停
	// toPointAndPassWithContinuityCurvature：曲线飞行，飞行器过点不停
	globalWaypointTurnMode: 'coordinateTurn' | 'toPointAndStopWithDiscontinuityCurvature' | 'toPointAndStopWithContinuityCurvature' | 'toPointAndPassWithContinuityCurvature';
	gimbalPitchMode: 'manual' | 'usePointSetting';
	globalWaypointHeadingParam: {
		waypointHeadingMode: 'followWayline' | 'manually' | 'fixed';
		waypointHeadingPathMode: 'clockwise' | 'counterClockwise' | 'followBadArc';
	};
	//如“<wpml:imageFormat>wide,ir</wpml:imageFormat>”
	payloadParam: {
		imageFormat: string[];
	};
	placemarks?: PointPlacemark[];
}

export interface PointPlacemark {
	// num: number;
	point: String; //[0,1]0.123456,34.123456,100
	executeHeight: number;
	actionsGroup?: ActionGroup[];
}

export interface ActionGroup {
	// actionGroupId: number;
	// actionGroupStartIndex: number;
	// actionGroupEndIndex: number;
	// actionGroupMode: string;
	actionTrigger: ActionTrigger;
	actionId: number;
	actionActuatorFunc: string;
	actionActuatorFuncParam: any;
}
export interface ActionTrigger {
	//   reachPoint：到达航点时执行
	// betweenAdjacentPoints：航段触发，均匀转云台
	// multipleTiming：等时触发
	// multipleDistance：等距触发
	// * 注：“betweenAdjacentPoints”需配合动作"gimbalEvenlyRotate"使用，“multipleTiming” 配合动作 “takePhoto” 即可实现等时间隔拍照，“multipleDistance” 配合动作 “takePhoto” 即可实现等距离间隔拍照。
	actionTriggerType: 'reachPoint' | 'betweenAdjacentPoints' | 'multipleTiming' | 'multipleDistance';
	//单位 s或m	> 0  * 注：当“actionTriggerType”为“multipleTiming”时，该元素表示间隔时间，单位是s。当“actionTriggerType”为“multipleDistance”时，该元素表示间隔距离，单位是m。
	actionTriggerParam: number;
}
