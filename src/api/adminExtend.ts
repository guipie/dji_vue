import request from '/@/utils/request';
enum Api {
  PostSqlQuery = '/api/sysDatabaseExtend/Query',
  PostSqlExecute = '/api/sysDatabaseExtend/Execute',
}

export const PostSqlQuery = (configId: string, sql: string) =>
  request({
    url: Api.PostSqlQuery + '/' + configId,
    method: 'post',
    data: sql,
  });

export const PostSqlExecute = (configId: string, sql: string) =>
  request({
    url: Api.PostSqlQuery + '/' + configId,
    method: 'post',
    data: sql,
  });
