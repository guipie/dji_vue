import { defineStore } from 'pinia';
import { pageDjiWorkspace } from '../api/main/djiWorkspace';
import { myDjiWorkspaces } from '../api/main/djiWorkspaceUser';

export const useStoreWorkspace = defineStore('workspace', {
	state: (): WrokspaceState => ({ spaces: [], mySpaces: [] }),
	getters: {
		// // 获取系统常量列表
		// async getSysConstList(): Promise<any[]> {
		// 	var res = await getAPI(SysConstApi).apiSysConstListGet();
		// 	this.constList = res.data.result ?? [];
		// 	return this.constList;
		// },
		defSpace: (state) => state.mySpaces.findLast((x: any) => x.isDefault) ?? null,
	},
	actions: {
		// 获取字典列表
		async getSpaces() {
			if (this.spaces.length == 0)
				return pageDjiWorkspace({
					page: 1,
					pageSize: 100,
				})
					.then((res) => {
						this.spaces = res.data.result.items;
						return this.spaces;
					})
					.catch(() => {
						return [];
					});
			return this.spaces;
		},

		async getMySpaces(isGet: boolean = false) {
			if (this.mySpaces.length == 0 || isGet)
				return myDjiWorkspaces()
					.then((res) => {
						this.mySpaces = res.data.result;
						return this.mySpaces;
					})
					.catch(() => {
						return [];
					});
			return this.mySpaces;
		},
	},
});
