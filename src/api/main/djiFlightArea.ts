import request from '/@/utils/request';

enum Api {
	Page = '/api/djiFlightArea/page',
	Locations = '/api/djiFlightArea/locations',
	DockOptions = '/api/djiFlightArea/dockOptions',
	SyncStatusOptions = '/api/djiFlightArea/syncStatusOptions',
	SyncReasonOptions = '/api/djiFlightArea/syncReasonOptions',
	Register = '/api/djiFlightArea/register',
	Update = '/api/djiFlightArea/update',
	Delete = '/api/djiFlightArea/delete',
}

/**
 * 飞行区文件分页
 * @description 链路是**设备驱动**的：云端登记文件 → 下发 `flight_areas_update` 通知 →
 * 设备自己在方便的时候来 `flight_areas_get` 要地址（云端此时现签 URL）→ 设备下载启用 →
 * 持续上报 `flight_areas_sync_progress`。因此「下发成功」≠「已生效」，
 * 真值只看列表里的 syncStatus
 */
export const pageDjiFlightArea = (params?: any) =>
	request({
		url: Api.Page,
		method: 'post',
		data: params,
	});

/**
 * 飞行器与各飞行区的距离快照
 * @description 每机场每区域一行（不随时间增长）。含 `enterCount` / `lastEnterTime`，
 * 用于回答「这片区域飞行器进去过几次」——历史距离流水无回溯价值，故不保留
 */
export const locationsDjiFlightArea = (dockSn: string) =>
	request({
		url: Api.Locations,
		method: 'get',
		data: { dockSn },
	});

/** 机场下拉 */
export const dockOptionsDjiFlightArea = (workspaceId?: string) =>
	request({
		url: Api.DockOptions,
		method: 'post',
		data: { workspaceId },
	});

/** 同步状态字典 */
export const syncStatusOptionsDjiFlightArea = () =>
	request({
		url: Api.SyncStatusOptions,
		method: 'get',
	});

/** 同步失败原因字典 */
export const syncReasonOptionsDjiFlightArea = () =>
	request({
		url: Api.SyncReasonOptions,
		method: 'get',
	});

/**
 * 登记飞行区文件
 * @param params.objectKey 对象存储 Key **或**完整 URL（两种都能识别）。
 * 文件本体先走平台的上传接口存到对象存储，这里只做登记
 * @description **SHA256 摘要由服务端从桶里的真实内容算出**，不接受人工填写 ——
 * 摘要是「云端认为该跑哪一版」与「设备实际同步到哪一版」唯一的对齐依据，
 * 填错会导致设备永远同步不上且两侧都不报错。仅在对象存储读不到内容时才退化为用入参 checksum
 */
export const registerDjiFlightArea = (params: {
	dockSn: string;
	fileName: string;
	objectKey: string;
	checksum?: string;
	syncImmediately?: boolean;
	confirm?: boolean;
}) =>
	request({
		url: Api.Register,
		method: 'post',
		data: params,
	});

/**
 * 通知设备重新拉取并启用飞行区文件
 * @description 这条指令没有入参（协议 data=null），设备收到后自己去调 `flight_areas_get`。
 * 会让设备重新加载作业区域（过程中飞行器需开机、图传需让出链路），故必须 confirm
 */
export const updateDjiFlightArea = (params: { dockSn: string; confirm: boolean }) =>
	request({
		url: Api.Update,
		method: 'post',
		data: params,
	});

/**
 * 删除飞行区文件记录（批量）
 * @description 只删记录，**不删对象存储里的文件**：设备可能仍在跑这份围栏，
 * 保留原件可在误删后迅速重新登记
 */
export const deleteDjiFlightArea = (ids: (number | string)[]) =>
	request({
		url: Api.Delete,
		method: 'post',
		data: { ids },
	});
