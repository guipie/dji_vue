import request from '/@/utils/request';
enum Api {
  AddChatModelOptions = '/api/chatModelOptions/add',
  DeleteChatModelOptions = '/api/chatModelOptions/delete',
  UpdateChatModelOptions = '/api/chatModelOptions/update',
  PageChatModelOptions = '/api/chatModelOptions/page',
  DetailChatModelOptions = '/api/chatModelOptions/detail',
  ModelDropdown = '/api/chatModelOptions/modelDropdown',
}

// 增加模型配置
export const addChatModelOptions = (params?: any) =>
  request({
    url: Api.AddChatModelOptions,
    method: 'post',
    data: params,
  });

// 删除模型配置
export const deleteChatModelOptions = (params?: any) =>
  request({
    url: Api.DeleteChatModelOptions,
    method: 'post',
    data: params,
  });

// 编辑模型配置
export const updateChatModelOptions = (params?: any) =>
  request({
    url: Api.UpdateChatModelOptions,
    method: 'post',
    data: params,
  });

// 分页查询模型配置
export const pageChatModelOptions = (params?: any) =>
  request({
    url: Api.PageChatModelOptions,
    method: 'post',
    data: params,
  });

// 详情模型配置
export const detailChatModelOptions = (id: any) =>
  request({
    url: Api.DetailChatModelOptions,
    method: 'get',
    data: { id },
  });

export const getModelDropdown = () =>
  request({
    url: Api.ModelDropdown,
    method: 'get'
  });
