import request from '/@/utils/request';
enum Api {
  AddSpecial = '/api/special/add',
  DeleteSpecial = '/api/special/delete',
  UpdateSpecial = '/api/special/update',
  RecommendTopSpecial = '/api/special/recommendTop',
  PageSpecial = '/api/special/page',
  UploadCover = '/api/special/UploadCover',
}

// 增加专栏
export const addSpecial = (params?: any) =>
  request({
    url: Api.AddSpecial,
    method: 'post',
    data: params,
  });

// 删除专栏
export const deleteSpecial = (params?: any) =>
  request({
    url: Api.DeleteSpecial,
    method: 'post',
    data: params,
  });

// 编辑专栏
export const updateSpecial = (params?: any) =>
  request({
    url: Api.UpdateSpecial,
    method: 'post',
    data: params,
  });
//推荐置顶专栏
export const recommendTopSpecial = (ids: string[], contentStatus: 1 | 2 | 3) =>
  request({
    url: Api.RecommendTopSpecial + '?contentStatus=' + contentStatus,
    method: 'post',
    data: ids,
  });
// 分页查询专栏
export const pageSpecial = (params?: any) =>
  request({
    url: Api.PageSpecial,
    method: 'post',
    data: params,
  });

/**
* 上传封面 
*/
export const uploadCover = (params: any) =>
  uploadFileHandle(params, Api.UploadCover)

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
