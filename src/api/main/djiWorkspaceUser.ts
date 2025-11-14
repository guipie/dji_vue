import request from '/@/utils/request';
enum Api {
	MyDjiWorkspaces = '/api/djiWorkspaceUser/my',
	SetDjiWorkspaceDefault = '/api/djiWorkspaceUser/set/default/{spaceId}',
	SetDjiWorkspaceUser = '/api/djiWorkspaceUser/set',
	AddDjiWorkspaceUser = '/api/djiWorkspaceUser/add',
	DeleteDjiWorkspaceUser = '/api/djiWorkspaceUser/delete',
	UpdateDjiWorkspaceUser = '/api/djiWorkspaceUser/update',
	PageDjiWorkspaceUser = '/api/djiWorkspaceUser/page',
	DetailDjiWorkspaceUser = '/api/djiWorkspaceUser/detail',
	GetSysUserUserIdDropdown = '/api/djiWorkspaceUser/SysUserUserIdDropdown',
}
export const myDjiWorkspaces = () =>
	request({
		url: Api.MyDjiWorkspaces,
		method: 'get',
	});
export const setDjiWorkspaceDefault = (spaceId: string) =>
	request({
		url: Api.SetDjiWorkspaceDefault.replace('{spaceId}', spaceId),
		method: 'post',
	});
export const setDjiWorkspaceUser = (params?: any) =>
	request({
		url: Api.SetDjiWorkspaceUser,
		method: 'post',
		data: params,
	});

// 增加空间用户
export const addDjiWorkspaceUser = (params?: any) =>
	request({
		url: Api.AddDjiWorkspaceUser,
		method: 'post',
		data: params,
	});

// 删除空间用户
export const deleteDjiWorkspaceUser = (params?: any) =>
	request({
		url: Api.DeleteDjiWorkspaceUser,
		method: 'post',
		data: params,
	});

// 编辑空间用户
export const updateDjiWorkspaceUser = (params?: any) =>
	request({
		url: Api.UpdateDjiWorkspaceUser,
		method: 'post',
		data: params,
	});

// 分页查询空间用户
export const pageDjiWorkspaceUser = (params?: any) =>
	request({
		url: Api.PageDjiWorkspaceUser,
		method: 'post',
		data: params,
	});

// 详情空间用户
export const detailDjiWorkspaceUser = (id: any) =>
	request({
		url: Api.DetailDjiWorkspaceUser,
		method: 'get',
		data: { id },
	});

export const getSysUserUserIdDropdown = () =>
	request({
		url: Api.GetSysUserUserIdDropdown,
		method: 'get',
	});
