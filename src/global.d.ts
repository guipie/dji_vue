import * as Cesium from 'cesium';

declare global {
	interface Window {
		viewer: Cesium.Viewer;
	}
}
