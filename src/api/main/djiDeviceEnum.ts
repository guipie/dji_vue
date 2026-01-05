import request from '/@/utils/request';
enum Api {
	GetDjiDeviceEnums = '/api/djiDeviceEnum/droneModels',
	AddDjiDeviceEnum = '/api/djiDeviceEnum/add',
	DeleteDjiDeviceEnum = '/api/djiDeviceEnum/delete',
	UpdateDjiDeviceEnum = '/api/djiDeviceEnum/update',
	PageDjiDeviceEnum = '/api/djiDeviceEnum/page',
	DetailDjiDeviceEnum = '/api/djiDeviceEnum/detail',
}
export const getDjiDeviceEnums = () =>
	request({
		url: Api.GetDjiDeviceEnums,
		method: 'get',
	});
// 增加设备枚举
export const addDjiDeviceEnum = (params?: any) =>
	request({
		url: Api.AddDjiDeviceEnum,
		method: 'post',
		data: params,
	});

// 删除设备枚举
export const deleteDjiDeviceEnum = (params?: any) =>
	request({
		url: Api.DeleteDjiDeviceEnum,
		method: 'post',
		data: params,
	});

// 编辑设备枚举
export const updateDjiDeviceEnum = (params?: any) =>
	request({
		url: Api.UpdateDjiDeviceEnum,
		method: 'post',
		data: params,
	});

// 分页查询设备枚举
export const pageDjiDeviceEnum = (params?: any) =>
	request({
		url: Api.PageDjiDeviceEnum,
		method: 'post',
		data: params,
	});

// 详情设备枚举
export const detailDjiDeviceEnum = (id: any) =>
	request({
		url: Api.DetailDjiDeviceEnum,
		method: 'get',
		data: { id },
	});
