import request from '/@/utils/request';
enum Api {
  ResetUserPwd = '/api/appUser/pwd/reset',
  DeleteAppUser = '/api/appUser/delete',
  PageAppUser = '/api/appUser/page',
  PagePayedAppUser = '/api/appUser/payed/page',
}

// 重置聚AI用户密码
export const resetUserPwd = (account: string, pwd: string) =>
  request({
    url: Api.ResetUserPwd,
    method: 'post',
    data: { account, password: pwd },
  });

// 删除聚AI用户
export const deleteAppUser = (params?: any) =>
  request({
    url: Api.DeleteAppUser,
    method: 'delete',
    data: params,
  });


// 分页查询聚AI用户
export const pageAppUser = (params?: any) =>
  request({
    url: Api.PageAppUser,
    method: 'post',
    data: params,
  });
// 分页查询聚AI用户
export const pagePayedAppUser = (params?: any) =>
  request({
    url: Api.PagePayedAppUser,
    method: 'post',
    data: params,
  });


