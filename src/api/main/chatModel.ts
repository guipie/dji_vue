import request from '/@/utils/request';
enum Api {
  AddChatModel = '/api/chatModel/add',
  DeleteChatModel = '/api/chatModel/delete',
  UpdateChatModel = '/api/chatModel/update',
  PageChatModel = '/api/chatModel/page',
  DetailChatModel = '/api/chatModel/detail',
  UploadAvatarUrl = '/api/chatModel/UploadAvatarUrl',
}

// 增加模型
export const addChatModel = (params?: any) =>
	request({
		url: Api.AddChatModel,
		method: 'post',
		data: params,
	});

// 删除模型
export const deleteChatModel = (params?: any) => 
	request({
			url: Api.DeleteChatModel,
			method: 'post',
			data: params,
		});

// 编辑模型
export const updateChatModel = (params?: any) => 
	request({
			url: Api.UpdateChatModel,
			method: 'post',
			data: params,
		});

// 分页查询模型
export const pageChatModel = (params?: any) => 
	request({
			url: Api.PageChatModel,
			method: 'post',
			data: params,
		});

// 详情模型
export const detailChatModel = (id: any) => 
	request({
			url: Api.DetailChatModel,
			method: 'get',
			data: { id },
		});

	/**
	* 上传模型头像 
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
