import request from '/@/utils/request';

enum Api {
	PageWaylineTask = '/api/djiWaylineTask/page',
	DetailWaylineTask = '/api/djiWaylineTask/detail',
	ProgressWaylineTask = '/api/djiWaylineTask/progress',
	ActiveWaylineTaskByDock = '/api/djiWaylineTask/activeByDock',
	StatusOptionsWaylineTask = '/api/djiWaylineTask/statusOptions',
	StepOptionsWaylineTask = '/api/djiWaylineTask/stepOptions',
	DockOptionsWaylineTask = '/api/djiWaylineTask/dockOptions',
	CreateWaylineTask = '/api/djiWaylineTask/create',
	ExecuteWaylineTask = '/api/djiWaylineTask/execute',
	PauseWaylineTask = '/api/djiWaylineTask/pause',
	RecoveryWaylineTask = '/api/djiWaylineTask/recovery',
	UndoWaylineTask = '/api/djiWaylineTask/undo',
	StopWaylineTask = '/api/djiWaylineTask/stop',
}

/**
 * 分页查询航线任务
 */
export const pageWaylineTask = (params?: any) =>
	request({
		url: Api.PageWaylineTask,
		method: 'post',
		data: params,
	});

/**
 * 任务详情（含断点与 KMZ 快照）
 */
export const detailWaylineTask = (id: number | string) =>
	request({
		url: Api.DetailWaylineTask,
		method: 'get',
		data: { id },
	});

/**
 * 任务进度流水（任务详情时间线）
 */
export const progressWaylineTask = (id: number | string, take = 200) =>
	request({
		url: Api.ProgressWaylineTask,
		method: 'get',
		data: { id, take },
	});

/**
 * 查询某机场当前未结束任务
 * @description 下发前预检，避免机场侧直接报「正在执行任务」而拒绝
 */
export const activeWaylineTaskByDock = (dockSn: string) =>
	request({
		url: Api.ActiveWaylineTaskByDock,
		method: 'post',
		data: { dockSn },
	});

/**
 * 任务状态字典
 * @description 由后端统一给出中文描述，前端不再维护映射表，避免前后端字典不一致
 */
export const statusOptionsWaylineTask = () =>
	request({
		url: Api.StatusOptionsWaylineTask,
		method: 'get',
	});

/**
 * 执行步骤字典
 */
export const stepOptionsWaylineTask = () =>
	request({
		url: Api.StepOptionsWaylineTask,
		method: 'get',
	});

/**
 * 可选执行机场（含在线与占用状态）
 */
export const dockOptionsWaylineTask = (workspaceId?: string) =>
	request({
		url: Api.DockOptionsWaylineTask,
		method: 'get',
		data: { workspaceId },
	});

/**
 * 下发航线任务
 * @description 后端按任务类型决定时序：立即任务 prepare+execute 连发；
 * 定时/条件任务只发 prepare，execute 由后台调度在就绪或执行前 2 分钟触发
 * @returns 任务主键 Id
 */
export const createWaylineTask = (params?: any) =>
	request({
		url: Api.CreateWaylineTask,
		method: 'post',
		data: params,
	});

/**
 * 手动执行任务（条件任务就绪后，或对「已下发」态补发执行指令）
 */
export const executeWaylineTask = (id: number | string) =>
	request({
		url: Api.ExecuteWaylineTask,
		method: 'post',
		data: { id },
	});

/**
 * 暂停任务（仅执行中可用）
 */
export const pauseWaylineTask = (id: number | string) =>
	request({
		url: Api.PauseWaylineTask,
		method: 'post',
		data: { id },
	});

/**
 * 恢复任务（仅暂停态可用）
 */
export const recoveryWaylineTask = (id: number | string) =>
	request({
		url: Api.RecoveryWaylineTask,
		method: 'post',
		data: { id },
	});

/**
 * 取消任务（机场随后会上报 canceled）
 */
export const undoWaylineTask = (id: number | string) =>
	request({
		url: Api.UndoWaylineTask,
		method: 'post',
		data: { id },
	});

/**
 * 结束任务（机场降落并退出工作模式）
 */
export const stopWaylineTask = (id: number | string, reason = 0) =>
	request({
		url: Api.StopWaylineTask,
		method: 'post',
		data: { id, reason },
	});
