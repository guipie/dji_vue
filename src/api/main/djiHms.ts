import request from '/@/utils/request';

enum Api {
	Page = '/api/djiHms/page',
	Detail = '/api/djiHms/detail',
	Active = '/api/djiHms/active',
	Stats = '/api/djiHms/stats',
	DockOptions = '/api/djiHms/dockOptions',
	LevelOptions = '/api/djiHms/levelOptions',
	ModuleOptions = '/api/djiHms/moduleOptions',
	StatusOptions = '/api/djiHms/statusOptions',
	Delete = '/api/djiHms/delete',
}

/**
 * HMS 告警分页
 * @description 数据来自机场 `hms` 事件。报文的 data.list 是「当前全部活跃告警」的**全量快照**，
 * 后端据此维护增量状态：上次有本次无 ⇒ 置为「已恢复」（记录保留，供追溯间歇性故障）
 */
export const pageDjiHms = (params?: any) =>
	request({
		url: Api.Page,
		method: 'post',
		data: params,
	});

/**
 * 告警详情
 */
export const detailDjiHms = (id: number | string) =>
	request({
		url: Api.Detail,
		method: 'get',
		data: { id },
	});

/**
 * 取某机场当前活跃告警（控制面板概览用）
 */
export const activeDjiHms = (dockSn: string) =>
	request({
		url: Api.Active,
		method: 'get',
		data: { dockSn },
	});

/**
 * 告警统计（总数 / 活跃数 / 各等级分布 / 按机场分组）
 */
export const statsDjiHms = (params?: { workspaceId?: string; dockSn?: string }) =>
	request({
		url: Api.Stats,
		method: 'post',
		data: params,
	});

/**
 * 机场下拉（附带各机场的活跃告警数，便于一眼看出哪台机场有问题）
 */
export const dockOptionsDjiHms = (workspaceId?: string) =>
	request({
		url: Api.DockOptions,
		method: 'post',
		data: { workspaceId },
	});

/**
 * 告警等级字典
 * @description 由后端枚举 `[Description]` 给出，前端不再维护映射表
 */
export const levelOptionsDjiHms = () =>
	request({
		url: Api.LevelOptions,
		method: 'get',
	});

/**
 * 告警模块字典（飞行任务 / 设备管理 / 媒体 / HMS）
 */
export const moduleOptionsDjiHms = () =>
	request({
		url: Api.ModuleOptions,
		method: 'get',
	});

/**
 * 告警状态字典（活跃 / 已恢复）
 */
export const statusOptionsDjiHms = () =>
	request({
		url: Api.StatusOptions,
		method: 'get',
	});

/**
 * 删除告警记录（批量，物理删除）
 * @description 会一并删掉已恢复的历史记录，间歇性故障将失去追溯依据，需二次确认
 */
export const deleteDjiHms = (ids: (number | string)[]) =>
	request({
		url: Api.Delete,
		method: 'post',
		data: { ids },
	});
