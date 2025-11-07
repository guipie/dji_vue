import request from '/@/utils/request';
enum Api {
  AddArticle = '/api/article/add',
  DeleteArticle = '/api/article/delete',
  UpdateArticle = '/api/article/update',
  PageArticle = '/api/article/page',
  UploadCover = '/api/article/UploadCover',
  GetSpecialDropdown = '/api/article/SpecialDropdown',
  RecommendTopArticle = '/api/article/recommendTop',
}

// 增加聚AI内容
export const addArticle = (params?: any) =>
  request({
    url: Api.AddArticle,
    method: 'post',
    data: params,
  });

// 删除聚AI内容
export const deleteArticle = (params?: any) =>
  request({
    url: Api.DeleteArticle,
    method: 'post',
    data: params,
  });

// 编辑聚AI内容
export const updateArticle = (params?: any) =>
  request({
    url: Api.UpdateArticle,
    method: 'post',
    data: params,
  });
//推荐置顶 
export const recommendTopArticle = (ids: string[], contentStatus: 1 | 2 | 3) =>
  request({
    url: Api.RecommendTopArticle + '?contentStatus=' + contentStatus,
    method: 'post',
    data: ids,
  });
// 分页查询聚AI内容
export const pageArticle = (params?: any) =>
  request({
    url: Api.PageArticle,
    method: 'post',
    data: params,
  });

/**
* 上传封面 
*/
export const uploadCover = (params: any) =>
  uploadFileHandle(params, Api.UploadCover)
export const getSpecialDropdown = () =>
  request({
    url: Api.GetSpecialDropdown,
    method: 'get'
  });

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
