import request from '/@/utils/request';
enum Api {
  AddMidjourneyNotify = '/api/midjourneyNotify/add',
  DeleteMidjourneyNotify = '/api/midjourneyNotify/delete',
  UpdateMidjourneyNotify = '/api/midjourneyNotify/update',
  PageMidjourneyNotify = '/api/midjourneyNotify/page',
  UploadOssUrl = '/api/midjourneyNotify/UploadOssUrl',
  RecommendTopMidjourneyNotify = '/api/midjourneyNotify/recommendTop',
  SyncMidjourneyNoticeToOss = '/api/adminMid/oss/sync',
  SyncBatchMidjourneyNoticeToOss = '/api/adminMid/oss/sync/batch',
  fetchToDbMidjourneyNotice = '/api/adminMid/fetchToDb'
}
// 推荐置顶Mid绘画
export const recommendTopMidjourneyNotify = (ids: string[], contentStatus: 1 | 2 | 3) =>
  request({
    url: Api.RecommendTopMidjourneyNotify + '?contentStatus=' + contentStatus,
    method: 'post',
    data: ids,
  });
// 同步Mid绘画七牛云
export const syncMidjourneyNotify = (id: string) =>
  request({
    url: Api.SyncMidjourneyNoticeToOss + '/' + id,
    method: 'post',
    timeout: 60000 * 10
  });
export const syncBatchMidjourneyNotify = (ids?: string[]) =>
  request({
    url: Api.SyncBatchMidjourneyNoticeToOss,
    method: 'post',
    timeout: 60000 * 10,
    data: ids
  });
// 同步Mid绘画到数据库
export const fetchToDbMidjourneyNotify = () =>
  request({
    url: Api.fetchToDbMidjourneyNotice,
    method: 'post',
    timeout: 60000 * 10
  });
// 增加Mid绘画
export const addMidjourneyNotify = (params?: any) =>
  request({
    url: Api.AddMidjourneyNotify,
    method: 'post',
    data: params,
  });

// 删除Mid绘画
export const deleteMidjourneyNotify = (params?: any) =>
  request({
    url: Api.DeleteMidjourneyNotify,
    method: 'post',
    data: params,
  });

// 编辑Mid绘画
export const updateMidjourneyNotify = (params?: any) =>
  request({
    url: Api.UpdateMidjourneyNotify,
    method: 'post',
    data: params,
  });

// 分页查询Mid绘画
export const pageMidjourneyNotify = (params?: any) =>
  request({
    url: Api.PageMidjourneyNotify,
    method: 'post',
    data: params,
  });

/**
* 上传云地址 
*/
export const uploadOssUrl = (params: any) =>
  uploadFileHandle(params, Api.UploadOssUrl)

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
