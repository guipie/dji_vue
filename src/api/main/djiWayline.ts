import request from '/@/utils/request';

enum Api {
	CreateDjiWayline = '/api/djiWayline/create',
	PageDjiWayline = '/api/djiWayline/page',
	DetailDjiWayline = '/api/djiWayline/detail',
	UpdateDjiWayline = '/api/djiWayline/update',
	DeleteDjiWayline = '/api/djiWayline/delete',
	RenameDjiWayline = '/api/djiWayline/rename',
	CopyDjiWayline = '/api/djiWayline/copy',
	ExportDjiWayline = '/api/djiWayline/export',
}

/**
 * 新增航线
 * @description 后端会依据航线参数生成大疆机场可识别的 KMZ 文件并落库
 * @returns 新增航线的 Id
 */
export const createDjiWayline = (params?: any) =>
	request({
		url: Api.CreateDjiWayline,
		method: 'post',
		data: params,
	});

/**
 * 分页查询航线
 */
export const pageDjiWayline = (params?: any) =>
	request({
		url: Api.PageDjiWayline,
		method: 'post',
		data: params,
	});

/**
 * 航线详情（含完整航线参数，供编辑器回填）
 */
export const detailDjiWayline = (id: number | string) =>
	request({
		url: Api.DetailDjiWayline,
		method: 'get',
		data: { id },
	});

/**
 * 更新航线（会重新生成 KMZ）
 */
export const updateDjiWayline = (params?: any) =>
	request({
		url: Api.UpdateDjiWayline,
		method: 'post',
		data: params,
	});

/**
 * 删除航线（软删除）
 */
export const deleteDjiWayline = (params?: any) =>
	request({
		url: Api.DeleteDjiWayline,
		method: 'post',
		data: params,
	});

/**
 * 航线重命名
 */
export const renameDjiWayline = (params?: any) =>
	request({
		url: Api.RenameDjiWayline,
		method: 'post',
		data: params,
	});

/**
 * 复制航线（可指定新名称与目标空间）
 * @returns 新航线的 Id
 */
export const copyDjiWayline = (params?: any) =>
	request({
		url: Api.CopyDjiWayline,
		method: 'post',
		data: params,
	});

/**
 * 导出 KMZ 文件流
 * @description 返回 Blob，配合 downloadByData 保存为本地文件
 */
export const exportDjiWayline = (id: number | string) =>
	request({
		url: Api.ExportDjiWayline,
		method: 'get',
		data: { id },
		responseType: 'blob',
	});
