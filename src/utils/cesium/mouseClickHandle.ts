import { drawWayline, waylinePointClick } from './waylineUtil';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import * as Cesium from 'cesium';

export interface MouseClickHandleOptions {
	/** 经度 */
	longitude: number;
	/** 纬度 */
	latitude: number;
	/** 高度 */
	height: number;
	entity: Cesium.Entity | null;
}
// 鼠标点击事件处理
export function mouseClickHandle(options: MouseClickHandleOptions) {
	if (options.entity) {
		if (options.entity.properties && options.entity.properties.isWaylinePoint) {
			waylinePointClick(options.entity.properties.pointIndex.getValue(), false);
		}
	} else if (useWaylineStore().$state.setHome) {
		console.log('首航点:', options.longitude, options.latitude);
		useWaylineStore().setHomeAction(false, { longitude: options.longitude, latitude: options.latitude, height: options.height });
		window.viewer.canvas.style.cursor = 'default';
		drawWayline();
	}
}
