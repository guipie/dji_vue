import { defineStore } from 'pinia';
import { WaylineState } from '../types/pinia';
import { TemplateTypeEnum } from '../types/wayline/waylineEnus';
import { initWaylineState } from './shard/waylineSard';
import { drawWayline } from '../utils/cesium/waylineUtil';
import { ElMessageBox } from 'element-plus';
import { ActionGroup } from '../types/wayline/waylineCreate';
import { flyTo } from '../utils/cesium/index';

export const useWaylineStore = defineStore('waylines', {
	state: (): WaylineState => initWaylineState(),
	persist: {
		key: 'piniaWaylineStore',
		storage: localStorage,
		// 请确保这些属性在 WaylineState 中存在，否则调整为实际存在的属性
		pick: ['curCreateWayline', 'setHome', 'selectedPointIndex', 'curCreateWaylineExt'],
	},
	getters: {
		curPoint: (state) => {
			if ((state.selectedPointIndex ?? -1) >= 0) {
				return state.curCreateWayline.folder.placemarks![state.selectedPointIndex!];
			}
			return null;
		},
		curAction: (state) => {
			if ((state.selectedPointIndex ?? -1) >= 0 && (state.selectedActionIndex ?? -1) >= 0 && (state.curCreateWayline.folder.placemarks ?? []).length > 0) {
				if ((state.selectedActionIndex ?? -2) + 1 > (state.curCreateWayline.folder.placemarks![state.selectedPointIndex!].actionsGroup?.length ?? 0)) {
					state.selectedActionIndex = null;
					return null;
				}
				return state.curCreateWayline.folder.placemarks![state.selectedPointIndex!].actionsGroup![state.selectedActionIndex!];
			}
			return null;
		},
		placemarks: (state) => state.curCreateWayline.folder.placemarks || [],
		// // 获取系统常量列表
		// async getSysConstList(): Promise<any[]> {
		// 	var res = await getAPI(SysConstApi).apiSysConstListGet();
		// 	this.constList = res.data.result ?? [];
		// 	return this.constList;
		// },
		// defSpace: (state) => state.mySpaces.findLast((x: any) => x.isDefault) ?? null,
	},
	actions: {
		setHomeAction(val: boolean, coordinate?: { longitude: number; latitude: number; height: number }) {
			this.setHome = val;
			if (!val && coordinate) {
				this.curCreateWaylineExt.homeCoordinate = coordinate;
			}
		},
		setWaylinePoint(longitude: number, latitude: number, index?: number) {
			this.curCreateWayline.folder.placemarks = this.curCreateWayline.folder.placemarks || [];
			var height = this.curCreateWayline.missionConfig.takeOffRefPointAGLHeight;
			if (index && index >= 0) {
				this.curCreateWayline.folder.placemarks.splice(index, 0, {
					point: `${longitude},${latitude},${height}`,
					executeHeight: height,
					useGlobalTurnParam: true,
					waypointTurnParam: {
						waypointTurnMode: this.curCreateWayline.folder.globalWaypointTurnMode,
						waypointTurnDampingDist: 0,
					},
					useGlobalHeadingParam: true,
					waypointHeadingParam: this.curCreateWayline.folder.globalWaypointHeadingParam,
				});
				this.selectedPointIndex = index;
			} else {
				this.curCreateWayline.folder.placemarks.push({
					point: `${longitude},${latitude},${height}`,
					executeHeight: height,
					useGlobalTurnParam: true,
					waypointTurnParam: {
						waypointTurnMode: this.curCreateWayline.folder.globalWaypointTurnMode,
						waypointTurnDampingDist: 0,
					},
					useGlobalHeadingParam: true,
					waypointHeadingParam: this.curCreateWayline.folder.globalWaypointHeadingParam,
				});
				this.selectedPointIndex = this.curCreateWayline.folder.placemarks.length - 1;
			}
		},
		setPointAction(action: ActionGroup) {
			console.log('航点动作配置:', action, this.selectedPointIndex);
			if ((this.selectedPointIndex ?? -1) >= 0) {
				const point = this.curCreateWayline.folder.placemarks![this.selectedPointIndex!];
				point.actionsGroup = point.actionsGroup || [];
				this.selectedActionIndex = point.actionsGroup.length;
				// 直接添加 action 对象并设置 actionId
				point.actionsGroup.push({
					...action,
					actionId: point.actionsGroup.length,
				});
			} else ElMessageBox.alert('请先选择一个航点');
		},
		setPointActionActuatorFuncParam(funcParam: ActionGroup) {
			console.log('航点动作执行参数配置:', funcParam, this.selectedPointIndex, this.selectedActionIndex);
			if ((this.selectedPointIndex ?? -1) >= 0 && (this.selectedActionIndex ?? -1) >= 0) {
				const point = this.curCreateWayline.folder.placemarks![this.selectedPointIndex!];
				var data = point.actionsGroup![this.selectedActionIndex!];
				point.actionsGroup![this.selectedActionIndex!] = {
					...data,
					...funcParam,
				};
			}
		},
		// setActionIndex(index: number) {
		// 	this.selectedActionIndex = index;
		// },
		moveWaylinePoint(oldIndex: number, newIndex: number) {
			const placemarks = this.curCreateWayline.folder.placemarks;
			if (placemarks && oldIndex >= 0 && newIndex >= 0 && oldIndex < placemarks.length && newIndex < placemarks.length) {
				// 移动位置
				placemarks.splice(newIndex, 0, ...placemarks.splice(oldIndex, 1));
				placemarks[newIndex].guid = crypto.randomUUID();
				// const newArray = [...placemarks];
				// const temp = newArray[newIndex];
				// newArray[newIndex] = newArray[oldIndex];
				// newArray[oldIndex] = temp;
				// this.curCreateWayline.folder.placemarks = newArray;
				drawWayline({ isFlyto: false });
			}
		},

		delWaylinePoint(index: number) {
			this.curCreateWayline.folder.placemarks!.splice(index, 1);
			if (this.selectedPointIndex === index && this.curCreateWayline.folder.placemarks!.length > 0) {
				this.selectedPointIndex = this.curCreateWayline.folder.placemarks!.length - 1;
			}
			window.viewer.entities.removeById(`waypoint_${index + 1}`);
			if (this.curCreateWayline.folder.placemarks?.length == 0) {
				this.selectedActionIndex = null;
				this.selectedPointIndex = null;
				return;
			}
			drawWayline();
		},
		deleteSelectedPointAction() {
			if ((this.selectedPointIndex ?? -1) >= 0 && (this.selectedActionIndex ?? -1) >= 0) {
				const point = this.curCreateWayline.folder.placemarks![this.selectedPointIndex!];
				point.actionsGroup!.splice(this.selectedActionIndex!, 1);
				// 重置 selectedActionIndex
				if (point.actionsGroup!.length === 0) {
					this.selectedActionIndex = null;
				} else if (this.selectedActionIndex! >= point.actionsGroup!.length) {
					this.selectedActionIndex = point.actionsGroup!.length - 1;
				}
			}
		},
	},
});
