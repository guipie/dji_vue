import request from '/@/utils/request';

enum Api {
	State = '/api/djiDock/state',
	Actions = '/api/djiDock/actions',
	Page = '/api/djiDock/page',
	Recent = '/api/djiDock/recent',
	DockOptions = '/api/djiDock/dockOptions',
	StatusOptions = '/api/djiDock/statusOptions',
	RiskOptions = '/api/djiDock/riskOptions',
	ModeOptions = '/api/djiDock/modeOptions',
	Execute = '/api/djiDock/execute',
	RtkCalibration = '/api/djiDock/rtkCalibration',
	ClearRunning = '/api/djiDock/clearRunning',
}

/**
 * 机场实时状态快照（OSD + state 合并后的可读形态）
 * @description 含舱盖 / 推杆 / 飞行器在舱 / 空调 / 电池模式 / 环境 / 电气等，
 * 以及「是否空闲」「当前活跃告警数」「在途指令」三个派生判断
 */
export const stateDjiDock = (dockSn: string) =>
	request({
		url: Api.State,
		method: 'get',
		data: { dockSn },
	});

/**
 * 该机场当前可执行的指令清单
 * @description **不只是指令列表，还带每个指令此刻能不能执行**：
 * 后端逐条判定（离线 / 急停 / 固件升级中 / 非空闲 / 同类指令在途）并给出 disabledReason，
 * 前端据此置灰按钮。不要在前端重新实现这套判断 —— 两侧规则一旦漂移就会出现「按钮能点但下发被拒」
 */
export const actionsDjiDock = (dockSn: string) =>
	request({
		url: Api.Actions,
		method: 'get',
		data: { dockSn },
	});

/**
 * 指令记录分页
 * @description 这张表同时充当**操作审计**：谁在什么时候对哪台机场下发了什么、结果如何
 */
export const pageDjiDock = (params?: any) =>
	request({
		url: Api.Page,
		method: 'post',
		data: params,
	});

/**
 * 某机场最近的指令记录（控制面板活动日志）
 */
export const recentDjiDock = (dockSn: string, limit = 20) =>
	request({
		url: Api.Recent,
		method: 'get',
		data: { dockSn, limit },
	});

/**
 * 机场下拉（含工作状态与是否有在途指令）
 */
export const dockOptionsDjiDock = (workspaceId?: string) =>
	request({
		url: Api.DockOptions,
		method: 'post',
		data: { workspaceId },
	});

/** 指令状态字典 */
export const statusOptionsDjiDock = () =>
	request({
		url: Api.StatusOptions,
		method: 'get',
	});

/** 风险等级字典 */
export const riskOptionsDjiDock = () =>
	request({
		url: Api.RiskOptions,
		method: 'get',
	});

/** 机场工作状态字典（mode_code） */
export const modeOptionsDjiDock = () =>
	request({
		url: Api.ModeOptions,
		method: 'get',
	});

/**
 * 执行机场控制指令
 * @param params.method 指令名（如 cover_open / device_reboot）
 * @param params.confirm 高风险指令必须显式确认；后端对危险指令会直接拒绝 confirm=false
 * @description 有参指令通过 `action` / `linkWorkmode` / `imei` 等字段传参，具体见后端 Actions 返回的 requiredFields
 */
export const executeDjiDock = (params: any) =>
	request({
		url: Api.Execute,
		method: 'post',
		data: params,
	});

/**
 * RTK 一键标定
 * @description 需要现场用已知坐标点标定，经纬高为标定点（非机场位置），属高风险操作
 */
export const rtkCalibrationDjiDock = (params: {
	dockSn: string;
	longitude: number;
	latitude: number;
	height: number;
	confirm: boolean;
}) =>
	request({
		url: Api.RtkCalibration,
		method: 'post',
		data: params,
	});

/**
 * 清除某机场所有在途指令（收口为「取消」）
 * @description 用于解除「该指令正在执行中」的按钮互斥 —— 指令回包成功但设备迟迟不推进度时会卡死
 */
export const clearRunningDjiDock = (dockSn: string) =>
	request({
		url: Api.ClearRunning,
		method: 'post',
		data: { dockSn },
	});
