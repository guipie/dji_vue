import request from '/@/utils/request';

enum Api {
	Page = '/api/djiAirSense/page',
	Recent = '/api/djiAirSense/recent',
	Stats = '/api/djiAirSense/stats',
	DockOptions = '/api/djiAirSense/dockOptions',
	LevelOptions = '/api/djiAirSense/levelOptions',
	Delete = '/api/djiAirSense/delete',
}

/**
 * AirSense 告警分页
 * @description **流水表**：每推一次报文就展开成多行（报文 data 本身是数组，一次可带多架民航客机）。
 * 这是安全事件证据，事后无法从任何快照反推，因此不做快照化处理，靠定时任务按保留期清理。
 * 无条件翻页会随数据增长变慢，页面上建议带时间范围
 */
export const pageDjiAirSense = (params?: any) =>
	request({
		url: Api.Page,
		method: 'post',
		data: params,
	});

/**
 * 某机场最近的若干条记录（地图告警条 / 控制面板用）
 */
export const recentDjiAirSense = (dockSn: string, limit = 50) =>
	request({
		url: Api.Recent,
		method: 'get',
		data: { dockSn, limit },
	});

/**
 * AirSense 统计
 * @description `alertCount` 是等级 ≥ 3（官方建议无人机避让）的条数，阈值由后端统一定义，
 * 前端不要硬编码 3
 */
export const statsDjiAirSense = (params?: { workspaceId?: string; dockSn?: string }) =>
	request({
		url: Api.Stats,
		method: 'post',
		data: params,
	});

/** 机场下拉 */
export const dockOptionsDjiAirSense = (workspaceId?: string) =>
	request({
		url: Api.DockOptions,
		method: 'post',
		data: { workspaceId },
	});

/** 告警等级字典（0 无危险 ~ 4 等级四） */
export const levelOptionsDjiAirSense = () =>
	request({
		url: Api.LevelOptions,
		method: 'get',
	});

/**
 * 删除 AirSense 记录（批量，物理删除）
 * @description 这些是安全事件证据，删除前请先导出留档
 */
export const deleteDjiAirSense = (ids: (number | string)[]) =>
	request({
		url: Api.Delete,
		method: 'post',
		data: { ids },
	});
