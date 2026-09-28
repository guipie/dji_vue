import request from '/@/utils/request';

enum Api {
	Page = '/api/djiOta/page',
	Detail = '/api/djiOta/detail',
	Devices = '/api/djiOta/devices',
	StatusOptions = '/api/djiOta/statusOptions',
	UpgradeTypeOptions = '/api/djiOta/upgradeTypeOptions',
	StepOptions = '/api/djiOta/stepOptions',
	BatchOptions = '/api/djiOta/batchOptions',
	Create = '/api/djiOta/create',
}

/**
 * 升级任务分页
 * @description **按批次一行**，不是按设备一行：`ota_progress` 报文里没有任何设备 SN，
 * 进度本身就是批次级的。要按设备看明细请用 `devices` 字段（后端从 devicesJson 解析）
 */
export const pageDjiOta = (params?: any) =>
	request({
		url: Api.Page,
		method: 'post',
		data: params,
	});

/** 任务详情（含逐设备明细） */
export const detailDjiOta = (id: number | string) =>
	request({
		url: Api.Detail,
		method: 'get',
		data: { id },
	});

/**
 * 该机场可升级的设备清单（机场本体 + 已建档的子设备）
 * @description 每项带当前版本与是否可升级；飞行器只有在舱时才允许升级
 */
export const devicesDjiOta = (dockSn: string) =>
	request({
		url: Api.Devices,
		method: 'get',
		data: { dockSn },
	});

/** 任务状态字典 */
export const statusOptionsDjiOta = () =>
	request({
		url: Api.StatusOptions,
		method: 'get',
	});

/** 升级类型字典（一致性 / 普通 / PSDK） */
export const upgradeTypeOptionsDjiOta = () =>
	request({
		url: Api.UpgradeTypeOptions,
		method: 'get',
	});

/** 升级步骤字典（下载固件 / 更新固件） */
export const stepOptionsDjiOta = () =>
	request({
		url: Api.StepOptions,
		method: 'get',
	});

/** 该机场的历史批次下拉（按批次号筛选） */
export const batchOptionsDjiOta = (dockSn: string) =>
	request({
		url: Api.BatchOptions,
		method: 'get',
		data: { dockSn },
	});

/**
 * 创建升级任务
 * @param params.devices 要升级的设备数组，每项 `{ deviceSn, targetVersion, upgradeType, fileUrl, md5, fileSize, fileName }`
 * @description 一致性升级只需 productVersion（设备自行取包）；普通升级必须给完整的包信息。
 * 一次任务只允许一种升级类型；后端会校验设备归属、飞行器在舱、无进行中任务
 */
export const createDjiOta = (params: any) =>
	request({
		url: Api.Create,
		method: 'post',
		data: params,
	});
