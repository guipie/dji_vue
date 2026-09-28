import request from '/@/utils/request';

enum Api {
	Page = '/api/djiLive/page',
	Detail = '/api/djiLive/detail',
	DockState = '/api/djiLive/dockState',
	DockOptions = '/api/djiLive/dockOptions',
	QualityOptions = '/api/djiLive/qualityOptions',
	LensOptions = '/api/djiLive/lensOptions',
	StatusOptions = '/api/djiLive/statusOptions',
	Start = '/api/djiLive/start',
	Stop = '/api/djiLive/stop',
	SetQuality = '/api/djiLive/setQuality',
	LensChange = '/api/djiLive/lensChange',
	CameraChange = '/api/djiLive/cameraChange',
}

/**
 * 分页查询直播会话
 */
export const pageDjiLive = (params?: any) =>
	request({
		url: Api.Page,
		method: 'post',
		data: params,
	});

/**
 * 会话详情（含推流 / 播放地址）
 */
export const detailDjiLive = (id: number | string) =>
	request({
		url: Api.Detail,
		method: 'get',
		data: { id },
	});

/**
 * 机场直播状态（页面主视图）
 * @description 返回可直播通道树 + 在播状态 + 并发上限 + 「服务端是否已配置直播」的判定
 */
export const dockStateDjiLive = (dockSn: string) =>
	request({
		url: Api.DockState,
		method: 'post',
		data: { dockSn },
	});

/**
 * 可直播机场下拉
 */
export const dockOptionsDjiLive = (workspaceId?: string) =>
	request({
		url: Api.DockOptions,
		method: 'post',
		data: { workspaceId },
	});

/**
 * 清晰度字典（0 自适应 / 1 流畅 / 2 标清 / 3 高清 / 4 超清）
 */
export const qualityOptionsDjiLive = () =>
	request({
		url: Api.QualityOptions,
		method: 'get',
	});

/**
 * 镜头字典（normal / wide / zoom / ir）
 */
export const lensOptionsDjiLive = () =>
	request({
		url: Api.LensOptions,
		method: 'get',
	});

/**
 * 会话状态字典
 */
export const statusOptionsDjiLive = () =>
	request({
		url: Api.StatusOptions,
		method: 'get',
	});

/**
 * 开始直播
 * @description videoId 必须来自 `dockState` 返回的通道列表，前端不可自行拼接
 */
export const startDjiLive = (params: { dockSn: string; videoId: string; videoQuality?: number }) =>
	request({
		url: Api.Start,
		method: 'post',
		data: params,
	});

/**
 * 停止直播
 */
export const stopDjiLive = (id: number | string) =>
	request({
		url: Api.Stop,
		method: 'post',
		data: { id },
	});

/**
 * 调整清晰度
 */
export const setQualityDjiLive = (id: number | string, videoQuality: number) =>
	request({
		url: Api.SetQuality,
		method: 'post',
		data: { id, videoQuality },
	});

/**
 * 切换镜头（只能切到该码流 switchableVideoTypes 里声明支持的类型）
 */
export const lensChangeDjiLive = (id: number | string, videoType: string) =>
	request({
		url: Api.LensChange,
		method: 'post',
		data: { id, videoType },
	});

/**
 * 切换 FPV 相机位置（0 舱内 / 1 舱外）
 */
export const cameraChangeDjiLive = (id: number | string, cameraPosition: number) =>
	request({
		url: Api.CameraChange,
		method: 'post',
		data: { id, cameraPosition },
	});
