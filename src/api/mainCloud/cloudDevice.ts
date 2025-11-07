import request from '/@/utils/request';
enum Api {
	BindWorkspace = '/api/cloud/bindWorkspace/{gateway}/{sn}',
}

// 绑定设备
export const bindWorkspace = (dockSn: string, sn: string) =>
	request({
		url: Api.BindWorkspace.replace('{gateway}', dockSn).replace('{sn}', sn),
		method: 'post',
	});
