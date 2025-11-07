import request from '/@/utils/request';
enum Api {
  AddChatGPT = '/api/chatGPT/add',
  DeleteChatGPT = '/api/chatGPT/delete',
  UpdateChatGPT = '/api/chatGPT/update',
  RecommendTopChatGPT = '/api/chatGPT/recommendTop',
  PageChatGPT = '/api/chatGPT/page',
  GetChatModelDropdown = '/api/chatGPT/ChatModelDropdown',
}
// 推荐置顶Mid绘画
export const recommendTopChatGPT = (ids: string[], contentStatus: 1 | 2 | 3) =>
  request({
    url: Api.RecommendTopChatGPT + '?contentStatus=' + contentStatus,
    method: 'post',
    data: ids,
  });
// 增加AI会话
export const addChatGPT = (params?: any) =>
  request({
    url: Api.AddChatGPT,
    method: 'post',
    data: params,
  });

// 删除AI会话
export const deleteChatGPT = (params?: any) =>
  request({
    url: Api.DeleteChatGPT,
    method: 'post',
    data: params,
  });

// 编辑AI会话
export const updateChatGPT = (params?: any) =>
  request({
    url: Api.UpdateChatGPT,
    method: 'post',
    data: params,
  });

// 分页查询AI会话
export const pageChatGPT = (params?: any) =>
  request({
    url: Api.PageChatGPT,
    method: 'post',
    data: params,
  });

export const getChatModelDropdown = () =>
  request({
    url: Api.GetChatModelDropdown,
    method: 'get'
  });

