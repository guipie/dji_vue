import { defineStore } from 'pinia';
import { WaylineState } from '../types/pinia';
import { TemplateTypeEnum } from '../types/wayline/waylineEnus';
import { initWaylineState } from './shard/waylineSard';

export const useCesiumStore = defineStore('cesiumStore', {
	state: () => {
		return {};
	},
	getters: {
		// // 获取系统常量列表
		// async getSysConstList(): Promise<any[]> {
		// 	var res = await getAPI(SysConstApi).apiSysConstListGet();
		// 	this.constList = res.data.result ?? [];
		// 	return this.constList;
		// },
		// defSpace: (state) => state.mySpaces.findLast((x: any) => x.isDefault) ?? null,
	},
	actions: {},
});
