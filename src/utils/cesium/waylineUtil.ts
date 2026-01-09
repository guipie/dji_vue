import * as Cesium from 'cesium';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { drawPoint, drawPolyline } from './drawHandler';
import { getHomeSvg } from '../data/svgDataHelper';
import { canvasPointWithText, flyToEntity } from '.';

import * as turf from '@turf/turf';
export interface DrawWaylineOptions {
	id?: string;
	name?: string;
	isForeRender?: boolean;
}
export function drawWayline(options?: DrawWaylineOptions) {
	var prams = useWaylineStore().$state.curCreateWayline;
	var ext = useWaylineStore().$state.curCreateWaylineExt;
	var points = prams.folder.placemarks?.map((item) => item.point.split(',').map(Number)) || [];

	if (ext.homeCoordinate && ext.homeCoordinate.latitude > 0 && ext.homeCoordinate.longitude > 0) {
		// const svg = getHomeSvg('#EFF311FF');
		// const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
		console.log('绘制起飞点：', ext.homeCoordinate);
		const entity = window.viewer.entities.getById('homePoint');
		if (entity) {
			const [lon, lat, height = 0] = [ext.homeCoordinate.longitude, ext.homeCoordinate.latitude, 0];
			const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, height);
			entity.position = new Cesium.ConstantPositionProperty(cartesian);
		} else
			drawPoint({
				position: [ext.homeCoordinate.longitude, ext.homeCoordinate.latitude, 0],
				labelText: '起飞点',
				labelStyle: { pixelOffset: new Cesium.Cartesian2(0, 20) },
				pointStyle: { pixelSize: 16 },
				id: 'homePoint',
				properties: {
					isHomePoint: true,
				},
				// svgUrl: svgDataUrl,
			});
		points.unshift([
			ext.homeCoordinate.longitude,
			ext.homeCoordinate.latitude,
			prams.missionConfig.flyToWaylineMode == 'safely' ? prams.missionConfig.takeOffRefPointAGLHeight : prams.missionConfig.takeOffSecurityHeight,
		]);
		const terrainHeight = window.viewer.scene.globe.getHeight(Cesium.Cartographic.fromDegrees(ext.homeCoordinate.longitude, ext.homeCoordinate.latitude)) || 0;
		points.unshift([ext.homeCoordinate.longitude, ext.homeCoordinate.latitude, terrainHeight]);
		console.log('aaaa', terrainHeight);
	}
	if (points.length > 1) {
		console.log('绘制航线：', points);
		var waylineEntity = drawPolyline({
			positions: points as [number, number, (number | undefined)?][],
			polylineStyle: {
				width: 5,
				material: Cesium.Color.fromCssColorString('#6AFC0A'),
			},
		});
		flyToEntity(waylineEntity);
	}
	for (let index = 0; index < (prams.folder.placemarks?.length ?? 0); index++) {
		const placemark = prams.folder.placemarks![index];
		const pointCoords = placemark.point.split(',').map(Number);
		if (pointCoords.length < 3) pointCoords.push(0);
		// var heightReference = pointCoords[2] > 0 ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;
		var waylinePointId = `waypoint_${index + 1}`;
		var pointEntity = window.viewer.entities.getById(waylinePointId);
		if (pointEntity) {
			const cartesian = Cesium.Cartesian3.fromDegrees(pointCoords[0], pointCoords[1], pointCoords[2]);
			pointEntity.position = new Cesium.ConstantPositionProperty(cartesian);
		} else
			drawPoint({
				position: pointCoords as [number, number, number?],
				id: waylinePointId,
				name: index.toString(),
				svgUrl: canvasPointWithText(index + 1 + '', '#2BFF00'),
				properties: {
					isWaylinePoint: true,
					pointIndex: index,
				},
			});
		var pointHeightLineId = `waypoint_heightline_${index + 1}`;
		var pointHeightLine = window.viewer.entities.getById(pointHeightLineId);
		if (pointHeightLine) {
			pointHeightLine.polyline!.positions = new Cesium.ConstantProperty([
				Cesium.Cartesian3.fromDegrees(pointCoords[0], pointCoords[1], 0),
				Cesium.Cartesian3.fromDegrees(pointCoords[0], pointCoords[1], pointCoords[2]),
			]);
		} else {
			drawPolyline({
				id: pointHeightLineId,
				positions: [
					[pointCoords[0], pointCoords[1], 0],
					[pointCoords[0], pointCoords[1], pointCoords[2]],
				],
				polylineStyle: {
					width: 0.8,
					material: Cesium.Color.fromCssColorString('#D1F505'),
				},
			});
		}
	}
	drawSelectPointWedge();
}

export function drawSelectPointWedge() {
	var selectPointIndex: number = useWaylineStore().$state.selectedPointIndex ?? -1;
	var points = useWaylineStore().$state.curCreateWayline.folder.placemarks?.map((item) => item.point.split(',').map(Number)) || [];
	var homePoint = useWaylineStore().$state.curCreateWaylineExt.homeCoordinate;
	if (selectPointIndex >= 0 && points.length > 0) {
		let startLongitude = 0;
		let startLatitude = 0;
		if (selectPointIndex == 0 && homePoint && homePoint.latitude > 0 && homePoint.longitude > 0) {
			startLongitude = homePoint.longitude;
			startLatitude = homePoint.latitude;
		} else if (selectPointIndex > 0 && points.length > selectPointIndex) {
			startLongitude = points[selectPointIndex - 1][0];
			startLatitude = points[selectPointIndex - 1][1];
		} else return;
		var endLongitude = points[selectPointIndex][0];
		var endLatitude = points[selectPointIndex][1];
		var endHeight = points[selectPointIndex][2] || 0;
		var heading = turf.bearing([startLongitude, startLatitude], [endLongitude, endLatitude]);
		var headingRadians = Cesium.Math.toRadians(heading);
		// 修正航向角 - 减去90度以补偿ENU坐标系的影响
		var correctedHeading = headingRadians - Cesium.Math.toRadians(90);

		var pos = Cesium.Cartesian3.fromDegrees(endLongitude, endLatitude, endHeight);
		// 直接使用headingPitchRollQuaternion，并指定局部坐标系
		var orientation = Cesium.Transforms.headingPitchRollQuaternion(pos, new Cesium.HeadingPitchRoll(correctedHeading, 0, 0), Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame);
		// var height = cartographic.height;
		// 创建Wedge实体，中心点在终点坐标
		var wedgeEntity = window.viewer.entities.getById('wayline_wedge');
		if (wedgeEntity) {
			wedgeEntity.position = new Cesium.ConstantPositionProperty(pos);
			wedgeEntity.orientation = new Cesium.ConstantProperty(orientation);
		} else
			wedgeEntity = window.viewer.entities.add({
				name: 'Wedge',
				id: 'wayline_wedge',
				position: pos,
				orientation: orientation,
				// orientation:Cesium.Transforms.headingPitchRollQuaternion(pos, new Cesium.HeadingPitchRoll(headingRadians, 0, 0), Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame),
				ellipsoid: {
					radii: new Cesium.Cartesian3(200.0, 200.0, 200.0), // 缩小半径，避免过大
					innerRadii: new Cesium.Cartesian3(1.0, 1.0, 1.0), // 内半径
					minimumClock: Cesium.Math.toRadians(-15.0), // 水平角度范围
					maximumClock: Cesium.Math.toRadians(15.0),
					minimumCone: Cesium.Math.toRadians(75.0), // 垂直角度范围
					maximumCone: Cesium.Math.toRadians(105.0),
					material: Cesium.Color.DARKCYAN.withAlpha(0.3),
					outline: true,
					outlineColor: Cesium.Color.DARKCYAN,
				},
			});
		return wedgeEntity;
	}
	return null;
}

export function waylinePointClick(index: number, isFlyTo: boolean = true) {
	console.log('点击航点：' + index);
	useWaylineStore().selectedPointIndex = index;
	drawSelectPointWedge();
	if (isFlyTo) {
		flyToEntity(window.viewer.entities.getById(`waypoint_${index + 1}`)!);
	}
}

export function waylineActionClick(index: number, actionIndex: number) {
	console.log('点击航点动作：' + index + ' ' + actionIndex);
	if (useWaylineStore().selectedPointIndex != index) waylinePointClick(index, true);
	useWaylineStore().selectedActionIndex = actionIndex;
}
