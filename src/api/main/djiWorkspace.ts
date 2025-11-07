import request from '/@/utils/request';
enum Api {
  AddDjiWorkspace = '/api/djiWorkspace/add',
  DeleteDjiWorkspace = '/api/djiWorkspace/delete',
  UpdateDjiWorkspace = '/api/djiWorkspace/update',
  PageDjiWorkspace = '/api/djiWorkspace/page',
  DetailDjiWorkspace = '/api/djiWorkspace/detail',
}

// 增加空间配置
export const addDjiWorkspace = (params?: any) =>
	request({
		url: Api.AddDjiWorkspace,
		method: 'post',
		data: params,
	});

// 删除空间配置
export const deleteDjiWorkspace = (params?: any) => 
	request({
			url: Api.DeleteDjiWorkspace,
			method: 'post',
			data: params,
		});

// 编辑空间配置
export const updateDjiWorkspace = (params?: any) => 
	request({
			url: Api.UpdateDjiWorkspace,
			method: 'post',
			data: params,
		});

// 分页查询空间配置
export const pageDjiWorkspace = (params?: any) => 
	request({
			url: Api.PageDjiWorkspace,
			method: 'post',
			data: params,
		});

// 详情空间配置
export const detailDjiWorkspace = (id: any) => 
	request({
			url: Api.DetailDjiWorkspace,
			method: 'get',
			data: { id },
		});


