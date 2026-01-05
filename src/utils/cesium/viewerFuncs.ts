// CesiumFlyTo.ts
import * as Cesium from 'cesium';

export type FlyToTarget =
	| [number, number, number?] // 单点
	| [number, number, number?][] // 多点
	| Cesium.Entity;

export interface FlyToOptions {
	duration?: number;
	height?: number; // 仅单点且无当前视角时兜底用
	heading?: number;
	pitch?: number;
}

/**
 * 飞到目标位置，若未传 options，则保持当前视角和距离
 */
export function flyTo(target: FlyToTarget, options: FlyToOptions = {}): Promise<void> {
	const { duration = 2.0, ...restOptions } = options;
	var viewer: Cesium.Viewer = window.viewer;
	return new Promise((resolve) => {
		let destinationCartesian: Cesium.Cartesian3 | null = null;
		let destinationRectangle: Cesium.Rectangle | null = null;

		// === 解析目标位置 ===
		if (Array.isArray(target)) {
			if (target.length === 0) {
				console.warn('flyTo: empty target');
				resolve();
				return;
			}
			if (typeof target[0] === 'number') {
				// 单点 [lon, lat, h?]
				const [lon, lat, h = 600] = target as [number, number, number?];
				destinationCartesian = Cesium.Cartesian3.fromDegrees(lon, lat, h);
			} else {
				// 多点 [[lon, lat], ...]
				const positions = target as [number, number, number?][];
				const cartesians = positions.map(([lon, lat, h = 0]) => Cesium.Cartesian3.fromDegrees(lon, lat, h));
				const cartographics = cartesians.map((p) => Cesium.Cartographic.fromCartesian(p));
				destinationRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);

				// 如果点重合，退化为单点
				if (Cesium.Math.equalsEpsilon(destinationRectangle.width, 0, Cesium.Math.EPSILON6) && Cesium.Math.equalsEpsilon(destinationRectangle.height, 0, Cesium.Math.EPSILON6)) {
					destinationCartesian = cartesians[0];
					destinationRectangle = null;
				}
			}
		} else if (target instanceof Cesium.Entity) {
			// 尝试从 Entity 提取位置或范围
			const entity = target;
			let points: Cesium.Cartesian3[] = [];

			if (Cesium.defined(entity.position)) {
				const pos = entity.position?.getValue(viewer.clock.currentTime);
				if (pos) points.push(pos);
			}

			if (entity.polyline) {
				const positionsProperty = entity.polyline.positions;
				const pos = positionsProperty?.getValue(viewer.clock.currentTime);
				if (Array.isArray(pos)) points.push(...pos);
			}

			if (entity.polygon) {
				const hierarchyProperty = entity.polygon.hierarchy;
				const hierarchy = hierarchyProperty?.getValue(viewer.clock.currentTime);
				if (hierarchy?.positions) points.push(...hierarchy.positions);
			}
			if (entity.point && Cesium.defined(entity.position)) {
				const pos = entity.position?.getValue(viewer.clock.currentTime);
				if (pos) points.push(pos);
			}

			if (points.length > 0) {
				if (points.length === 1) {
					destinationCartesian = points[0];
				} else {
					const cartographics = points.map((p) => Cesium.Cartographic.fromCartesian(p));
					destinationRectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
					if (Cesium.Math.equalsEpsilon(destinationRectangle.width, 0, Cesium.Math.EPSILON6) && Cesium.Math.equalsEpsilon(destinationRectangle.height, 0, Cesium.Math.EPSILON6)) {
						destinationCartesian = points[0];
						destinationRectangle = null;
					}
				}
			} else {
				console.warn('flyTo: Entity has no position or graphics', entity.id);
				resolve();
				return;
			}
		} else {
			console.error('flyTo: Unsupported target type', target);
			resolve();
			return;
		}

		// === 计算飞行参数 ===
		const camera = viewer.camera;
		let heading: number, pitch: number, range: number;

		if (Object.keys(options).length === 0) {
			// 👉 用户未传 options：保持当前视角
			const cartographic = camera.positionCartographic;
			heading = camera.heading;
			pitch = camera.pitch;
			// 距离：如果是单点，用当前相机到目标的距离；否则用当前高度
			if (destinationCartesian) {
				range = Cesium.Cartesian3.distance(camera.position, destinationCartesian);
			} else {
				// 多点/矩形：用当前高度作为参考
				range = cartographic.height;
			}
		} else {
			// 用户传了 options：使用默认或传入值
			const defaultHeight = 1000;
			heading = Cesium.Math.toRadians(restOptions.heading ?? 0);
			pitch = Cesium.Math.toRadians(restOptions.pitch ?? -60);
			range = restOptions.height ?? defaultHeight;
		}

		// === 构建飞行目标 ===
		if (destinationCartesian) {
			viewer.camera.flyTo({
				destination: destinationCartesian,
				orientation: {
					heading,
					pitch,
					roll: 0,
				},
				duration,
				complete: () => resolve(),
				cancel: () => resolve(),
				...restOptions,
			});
		} else if (destinationRectangle) {
			// 对于矩形区域，使用 offset 无法直接应用，改用 flyToBoundingSphere 模拟
			// 使用 fromRectangle3D 并指定高度偏移
			const bs = Cesium.BoundingSphere.fromRectangle3D(
				destinationRectangle,
				viewer.scene.globe.ellipsoid,
				range // 高度由 options 或默认值决定
			);

			viewer.camera.flyToBoundingSphere(bs, {
				offset: new Cesium.HeadingPitchRange(heading, pitch, range),
				duration,
				complete: () => resolve(),
				cancel: () => resolve(),
				...restOptions,
			});
		} else {
			resolve();
		}
	});
}
