import request from '/@/utils/request';
enum Api {
	BindWorkspace = '/api/cloud/bindWorkspace/{gateway}/{sn}',
	OnlineSnapshots = '/api/cloud/onlineSnapshots',
}

// 绑定设备
export const bindWorkspace = (dockSn: string, sn: string) =>
	request({
		url: Api.BindWorkspace.replace('{gateway}', dockSn).replace('{sn}', sn),
		method: 'post',
	});

/**
 * 机场在线快照
 *
 * 用于「在线机场」页首屏渲染；挂载后仍由 SignalR 增量更新。
 * @param workspaceId 可选，按工作空间过滤
 */
export const getDockOnlineSnapshots = (workspaceId?: string) =>
	request({
		url: Api.OnlineSnapshots,
		method: 'post',
		data: { workspaceId },
	});
