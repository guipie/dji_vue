import request from '/@/utils/request';
enum Api {
  AddDjiDevice = '/api/djiDevice/add',
  DeleteDjiDevice = '/api/djiDevice/delete',
  UpdateDjiDevice = '/api/djiDevice/update',
  PageDjiDevice = '/api/djiDevice/page',
  DetailDjiDevice = '/api/djiDevice/detail',
  GetDjiWorkspaceWorkspaceIdDropdown = '/api/djiDevice/DjiWorkspaceWorkspaceIdDropdown',
  GetDjiDeviceParentSnDropdown = '/api/djiDevice/DjiDeviceParentSnDropdown',
  UploadAvatarUrl = '/api/djiDevice/UploadAvatarUrl',
}

// 增加设备
export const addDjiDevice = (params?: any) =>
	request({
		url: Api.AddDjiDevice,
		method: 'post',
		data: params,
	});

// 删除设备
export const deleteDjiDevice = (params?: any) => 
	request({
			url: Api.DeleteDjiDevice,
			method: 'post',
			data: params,
		});

// 编辑设备
export const updateDjiDevice = (params?: any) => 
	request({
			url: Api.UpdateDjiDevice,
			method: 'post',
			data: params,
		});

// 分页查询设备
export const pageDjiDevice = (params?: any) => 
	request({
			url: Api.PageDjiDevice,
			method: 'post',
			data: params,
		});

// 详情设备
export const detailDjiDevice = (id: any) => 
	request({
			url: Api.DetailDjiDevice,
			method: 'get',
			data: { id },
		});

export const getDjiWorkspaceWorkspaceIdDropdown = () =>
		request({
		url: Api.GetDjiWorkspaceWorkspaceIdDropdown,
		method: 'get'
		});
export const getDjiDeviceParentSnDropdown = () =>
		request({
		url: Api.GetDjiDeviceParentSnDropdown,
		method: 'get'
		});
	/**
	* 上传avatar_url 
	*/
export const uploadAvatarUrl = (params: any) =>
		uploadFileHandle(params, Api.UploadAvatarUrl)

	export const uploadFileHandle = (params: any, url: string) => { 
	const formData = new window.FormData();
	formData.append('file', params.file);
	//自定义参数
	if (params.data) {
		Object.keys(params.data).forEach((key) => {
			const value = params.data![key];
			if (Array.isArray(value)) {
				value.forEach((item) => {
					formData.append(`${key}[]`, item);
				});
				return;
			}
			formData.append(key, params.data![key]);
		});
	}
	return request({
		url: url,
		method: 'POST',
		data: formData,
		headers: {
			'Content-type': 'multipart/form-data;charset=UTF-8',
			// ts-ignore
			ignoreCancelToken: true,
		},
	});
};
