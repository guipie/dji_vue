import request from '/@/utils/request';

enum Api {
	Page = '/api/djiMedia/page',
	Detail = '/api/djiMedia/detail',
	ByTask = '/api/djiMedia/byTask',
	Stats = '/api/djiMedia/stats',
	TaskOptions = '/api/djiMedia/taskOptions',
	TypeOptions = '/api/djiMedia/typeOptions',
	DockOptions = '/api/djiMedia/dockOptions',
	Delete = '/api/djiMedia/delete',
	Prioritize = '/api/djiMedia/prioritize',
}

/**
 * 分页查询媒体文件
 * @description 数据来自机场 `file_upload_callback` 上报的元数据，文件本体在对象存储
 */
export const pageDjiMedia = (params?: any) =>
	request({
		url: Api.Page,
		method: 'post',
		data: params,
	});

/**
 * 媒体详情（含 bucket / 业务路径 / 型号枚举）
 */
export const detailDjiMedia = (id: number | string) =>
	request({
		url: Api.Detail,
		method: 'get',
		data: { id },
	});

/**
 * 按航线任务取全部媒体（按拍摄时间正序，用于按航点顺序浏览）
 * @param flightId 协议 flight_id；与 taskId 二者其一
 */
export const mediaByTask = (params: { flightId?: string; taskId?: number | string }) =>
	request({
		url: Api.ByTask,
		method: 'post',
		data: params,
	});

/**
 * 媒体统计（总数 / 总大小 / 分类型）
 */
export const statsDjiMedia = (params?: { workspaceId?: string; dockSn?: string }) =>
	request({
		url: Api.Stats,
		method: 'post',
		data: params,
	});

/**
 * 有媒体的任务列表（筛选下拉）
 */
export const taskOptionsDjiMedia = (params?: { workspaceId?: string; dockSn?: string }) =>
	request({
		url: Api.TaskOptions,
		method: 'post',
		data: params,
	});

/**
 * 媒体类型字典
 * @description 由后端枚举 `[Description]` 统一给出，前端不再维护映射表
 */
export const typeOptionsDjiMedia = () =>
	request({
		url: Api.TypeOptions,
		method: 'get',
	});

/**
 * 机场下拉（只含 Domain=Dock，附带各自已回传的媒体数量）
 */
export const dockOptionsDjiMedia = (workspaceId?: string) =>
	request({
		url: Api.DockOptions,
		method: 'post',
		data: { workspaceId },
	});

/**
 * 删除媒体记录（批量）
 * @description 只删元数据，**不会删除对象存储里的文件**；
 * 释放空间需在对象存储侧按前缀清理
 */
export const deleteDjiMedia = (ids: (number | string)[]) =>
	request({
		url: Api.Delete,
		method: 'post',
		data: { ids },
	});

/**
 * 把某任务的媒体调整为最高上传优先级
 * @description 机场自动排队，此处用于「这次任务的成果更急」时人工插队
 */
export const prioritizeDjiMedia = (flightId: string) =>
	request({
		url: Api.Prioritize,
		method: 'post',
		data: { flightId },
	});
