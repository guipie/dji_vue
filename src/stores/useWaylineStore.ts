import { defineStore } from 'pinia';
import { WaylineState } from '../types/pinia';
import { TemplateTypeEnum } from '../types/wayline/waylineEnus';
import { initWaylineState } from './shard/waylineSard';
import { drawWayline } from '../utils/cesium/waylineUtil';
import { ElMessageBox } from 'element-plus';

export const useWaylineStore = defineStore('waylines', {
	state: (): WaylineState => initWaylineState(),
	persist: {
		key: 'piniaWaylineStore',
		storage: localStorage,
		// 请确保这些属性在 WaylineState 中存在，否则调整为实际存在的属性
		pick: ['curCreateWayline', 'setHome', 'selectedPointIndex', 'curCreateWaylineExt'],
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
				});
				this.selectedPointIndex = index;
			} else {
				this.curCreateWayline.folder.placemarks.push({
					point: `${longitude},${latitude},${height}`,
					executeHeight: height,
				});
				this.selectedPointIndex = this.curCreateWayline.folder.placemarks.length - 1;
			}
		},
		setPointAction(action: any) {
			console.log('航点动作配置:', action, this.selectedPointIndex);
			if ((this.selectedPointIndex ?? -1) >= 0) {
				const point = this.curCreateWayline.folder.placemarks![this.selectedPointIndex!];
				point.actionsGroup = point.actionsGroup || [];
				this.selectedActionIndex = point.actionsGroup.length;
				point.actionsGroup.push({
					actionTrigger: {
						actionTriggerType: action.actionTriggerType,
						actionTriggerParam: action.actionTriggerParam,
					},
					actionId: point.actionsGroup.length,
					actionActuatorFunc: action.value,
					actionActuatorFuncParam: action.actionActuatorFuncParam,
				});
			} else ElMessageBox.alert('请先选择一个航点');
		},
		// setActionIndex(index: number) {
		// 	this.selectedActionIndex = index;
		// },
		delWaylinePoint(index: number) {
			this.curCreateWayline.folder.placemarks!.splice(index, 1);
			if (this.selectedPointIndex === index && this.curCreateWayline.folder.placemarks!.length > 0) {
				this.selectedPointIndex = this.curCreateWayline.folder.placemarks!.length - 1;
			}
			window.viewer.entities.removeById(`waypoint_${index + 1}`);
			drawWayline();
		},
	},
});
