import request from '/@/utils/request';
enum Api {
  AddTokenPayRecord = '/api/tokenPayRecord/add',
  DeleteTokenPayRecord = '/api/tokenPayRecord/delete',
  UpdateTokenPayRecord = '/api/tokenPayRecord/update',
  PageTokenPayRecord = '/api/tokenPayRecord/page',
}

// 增加充值记录
export const addTokenPayRecord = (params?: any) =>
	request({
		url: Api.AddTokenPayRecord,
		method: 'post',
		data: params,
	});

// 删除充值记录
export const deleteTokenPayRecord = (params?: any) => 
	request({
			url: Api.DeleteTokenPayRecord,
			method: 'post',
			data: params,
		});

// 编辑充值记录
export const updateTokenPayRecord = (params?: any) => 
	request({
			url: Api.UpdateTokenPayRecord,
			method: 'post',
			data: params,
		});

// 分页查询充值记录
export const pageTokenPayRecord = (params?: any) => 
	request({
			url: Api.PageTokenPayRecord,
			method: 'post',
			data: params,
		});


