import request from '/@/utils/request';
enum Api {
  AddDjiDeviceCameraEnum = '/api/djiDeviceCameraEnum/add',
  DeleteDjiDeviceCameraEnum = '/api/djiDeviceCameraEnum/delete',
  UpdateDjiDeviceCameraEnum = '/api/djiDeviceCameraEnum/update',
  PageDjiDeviceCameraEnum = '/api/djiDeviceCameraEnum/page',
  DetailDjiDeviceCameraEnum = '/api/djiDeviceCameraEnum/detail',
}

// 增加相机枚举
export const addDjiDeviceCameraEnum = (params?: any) =>
	request({
		url: Api.AddDjiDeviceCameraEnum,
		method: 'post',
		data: params,
	});

// 删除相机枚举
export const deleteDjiDeviceCameraEnum = (params?: any) => 
	request({
			url: Api.DeleteDjiDeviceCameraEnum,
			method: 'post',
			data: params,
		});

// 编辑相机枚举
export const updateDjiDeviceCameraEnum = (params?: any) => 
	request({
			url: Api.UpdateDjiDeviceCameraEnum,
			method: 'post',
			data: params,
		});

// 分页查询相机枚举
export const pageDjiDeviceCameraEnum = (params?: any) => 
	request({
			url: Api.PageDjiDeviceCameraEnum,
			method: 'post',
			data: params,
		});

// 详情相机枚举
export const detailDjiDeviceCameraEnum = (id: any) => 
	request({
			url: Api.DetailDjiDeviceCameraEnum,
			method: 'get',
			data: { id },
		});


