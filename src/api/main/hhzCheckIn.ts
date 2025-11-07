import request from '/@/utils/request';
enum Api {
  AddHhzCheckIn = '/api/hhzCheckIn/add',
  DeleteHhzCheckIn = '/api/hhzCheckIn/delete',
  UpdateHhzCheckIn = '/api/hhzCheckIn/update',
  PageHhzCheckIn = '/api/hhzCheckIn/page',
  DetailHhzCheckIn = '/api/hhzCheckIn/detail',
}

// 增加checkin
export const addHhzCheckIn = (params?: any) =>
	request({
		url: Api.AddHhzCheckIn,
		method: 'post',
		data: params,
	});

// 删除checkin
export const deleteHhzCheckIn = (params?: any) => 
	request({
			url: Api.DeleteHhzCheckIn,
			method: 'post',
			data: params,
		});

// 编辑checkin
export const updateHhzCheckIn = (params?: any) => 
	request({
			url: Api.UpdateHhzCheckIn,
			method: 'post',
			data: params,
		});

// 分页查询checkin
export const pageHhzCheckIn = (params?: any) => 
	request({
			url: Api.PageHhzCheckIn,
			method: 'post',
			data: params,
		});

// 详情checkin
export const detailHhzCheckIn = (id: any) => 
	request({
			url: Api.DetailHhzCheckIn,
			method: 'get',
			data: { id },
		});


