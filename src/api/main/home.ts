import request from '/@/utils/request';
enum Api {
  homeUser = '/api/statistics/homeUser',
  homeContent = '/api/statistics/homeContent',
  homeAI = '/api/statistics/homeAI',
  homePay = '/api/statistics/homePay',
}
export const getHomeUser = () =>
  request({
    url: Api.homeUser,
    method: 'get',
  });
export const getHomeContent= () =>
  request({
    url: Api.homeContent,
    method: 'get',
  });
export const getHomeAi= () =>
  request({
    url: Api.homeAI,
    method: 'get',
  });
export const getHomePay = () =>
  request({
    url: Api.homePay,
    method: 'get',
  });