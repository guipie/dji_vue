import request from '/@/utils/request';

enum Api {
	Page = '/api/djiLog/page',
	Stats = '/api/djiLog/stats',
	ModuleOptions = '/api/djiLog/moduleOptions',
	StatusOptions = '/api/djiLog/statusOptions',
	List = '/api/djiLog/list',
	Start = '/api/djiLog/start',
	Cancel = '/api/djiLog/cancel',
	Delete = '/api/djiLog/delete',
}

/**
 * 日志文件分页
 * @description 数据分两步产生：`list` 先向设备列举并把索引落库（「这张表是进度能落地的前提」，
 * 因为 `fileupload_progress` 里没有 boot_index，只有靠列举结果才能匹配），
 * 再 `start` 下发上传，设备直传对象存储，进度由 `fileupload_progress` 回写
 */
export const pageDjiLog = (params?: any) =>
	request({
		url: Api.Page,
		method: 'post',
		data: params,
	});

/** 日志统计（待上传 / 上传中 / 已上传 / 失败 + 总大小） */
export const statsDjiLog = (params?: { workspaceId?: string; dockSn?: string }) =>
	request({
		url: Api.Stats,
		method: 'post',
		data: params,
	});

/** 模块字典（0 飞行器 / 3 机场） */
export const moduleOptionsDjiLog = () =>
	request({
		url: Api.ModuleOptions,
		method: 'get',
	});

/** 上传状态字典 */
export const statusOptionsDjiLog = () =>
	request({
		url: Api.StatusOptions,
		method: 'get',
	});

/**
 * 向设备列举可上传的日志并返回该机场最新清单
 * @param params.modules 留空表示两个模块都问（设备只返回被问到的模块）
 */
export const listDjiLog = (params: { dockSn: string; modules?: number[] }) =>
	request({
		url: Api.List,
		method: 'post',
		data: params,
	});

/**
 * 发起日志上传
 * @param params.ids 要上传的日志记录主键
 * @description **一次只能上传一个模块**：协议只支持按模块取消（`fileupload_update` + module_list），
 * 多模块并发时无法分别取消，因此后端会直接拒绝混选
 */
export const startDjiLog = (params: { dockSn: string; ids: (number | string)[] }) =>
	request({
		url: Api.Start,
		method: 'post',
		data: params,
	});

/**
 * 取消日志上传
 * @param params.modules 要取消的模块（协议粒度只到模块，无法按单个文件取消）
 */
export const cancelDjiLog = (params: { dockSn: string; modules: number[] }) =>
	request({
		url: Api.Cancel,
		method: 'post',
		data: params,
	});

/**
 * 删除日志记录（批量）
 * @description 只删记录，**不删对象存储里的文件**；日志本身是证据，删除需谨慎
 */
export const deleteDjiLog = (ids: (number | string)[]) =>
	request({
		url: Api.Delete,
		method: 'post',
		data: { ids },
	});
