/**
 * 飞行区 / 禁飞区在 Cesium 上的绘制与拾取。
 *
 * 约定：viewer 是全局单例 window.viewer（与 utils/cesium 保持一致），
 * 本模块只负责「区域图层」这一层职责，viewer 的生命周期由页面管理。
 *
 * 交互为什么用「左键加点 + 回车/按钮完成」而不是双击结束：
 * Cesium 的 LEFT_DOUBLE_CLICK 会先派发两次 LEFT_CLICK，双击结束时会在末端多出 1~2 个重复顶点，
 * 做去重又要靠时间戳猜测用户意图，不可靠。显式「完成」是一种更低风险的选择。
 */
import * as Cesium from 'cesium';

/** 后端枚举 FlyZoneTypeEnum */
export const FlyZoneType = { CustomFlyZone: 0, NoFlyZone: 1 } as const;
/** 后端枚举 FlyZoneShapeEnum */
export const FlyZoneShape = { Polygon: 0, Circle: 1 } as const;

export interface FlyZoneRow {
	id: number;
	name: string;
	zoneType: number;
	shape: number;
	geometry: string;
	radius: number;
	minHeight: number;
	maxHeight: number;
	color?: string;
	isEnabled: boolean;
	areaSquareMeters?: number;
	perimeterMeters?: number;
	vertexCount?: number;
}

const ENTITY_PREFIX = 'flyzone-';

/** 默认配色：作业区绿（可飞），禁飞区红 */
export const DEFAULT_COLORS: Record<number, string> = {
	[FlyZoneType.CustomFlyZone]: '#22c55e',
	[FlyZoneType.NoFlyZone]: '#ef4444',
};

export function zoneColor(row: Pick<FlyZoneRow, 'zoneType' | 'color'>): Cesium.Color {
	const css = row.color || DEFAULT_COLORS[row.zoneType] || DEFAULT_COLORS[FlyZoneType.CustomFlyZone];
	try {
		return Cesium.Color.fromCssColorString(css);
	} catch {
		return Cesium.Color.fromCssColorString(DEFAULT_COLORS[FlyZoneType.CustomFlyZone]!);
	}
}

/**
 * 解析后端存的 GeoJSON geometry 串 → 经纬度数组。
 *
 * 同时兼容两种落库格式（只读，不改写）：
 *  - 标准 GeoJSON：Point 的 coordinates 是 [lon,lat]，Polygon 是 [[[lon,lat],...]]（三层）；
 *  - 本项目历史/扁平写法：Point 是 [[lon,lat]]，Polygon 是 [[lon,lat],...]（两层）。
 * 旧版只认「coords[0][0] 是数组」的三层结构，遇到两层 Polygon 只会取第一个顶点，
 * 导致 points.length < 3 → renderZone 直接 return null（多边形既不渲染也飞不动）。
 */
export function parseRing(geometry: string): [number, number][] {
	const out: [number, number][] = [];
	if (!geometry) return out;
	try {
		const geo = JSON.parse(geometry);
		let coords = geo?.coordinates;
		if (!coords) return out;

		// 圆形（Point）：标准 [lon,lat] 或扁平 [[lon,lat]] 都兼容
		if (geo.type === 'Point') {
			const pos = Array.isArray(coords[0]) ? coords[0] : coords;
			if (Array.isArray(pos) && pos.length >= 2 && typeof pos[0] === 'number') {
				out.push([Number(pos[0]), Number(pos[1])]);
			}
			return out;
		}

		// 多边形：以「coords[0][0] 是否为数字」判断层级。
		// 是数字 → coords 本身就是一条环（两层扁平写法）；否则取第一个环（三层标准写法）。
		if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
			coords = coords[0];
		}
		for (const p of coords) {
			if (Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number') {
				out.push([Number(p[0]), Number(p[1])]);
			}
		}
	} catch {
		/* 几何串异常就当作空 */
	}
	return out;
}

/** 渲染一个区域。重复渲染同一个 id 会先移除旧实体 */
export function renderZone(row: FlyZoneRow): Cesium.Entity | null {
	const viewer: Cesium.Viewer = (window as any).viewer;
	if (!viewer) return null;

	removeZone(row.id);
	const base = zoneColor(row);
	const alpha = row.isEnabled ? 0.28 : 0.12;
	const outline = row.isEnabled ? base.withAlpha(1) : base.withAlpha(0.5);

	const id = `${ENTITY_PREFIX}${row.id}`;
	const points = parseRing(row.geometry);

	if (row.shape === FlyZoneShape.Circle) {
		const [lon, lat] = points[0] ?? [0, 0];
		return viewer.entities.add({
			id,
			name: row.name,
			position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
			ellipse: {
				semiMinorAxis: row.radius,
				semiMajorAxis: row.radius,
				material: base.withAlpha(alpha),
				outline: true,
				outlineColor: outline,
				outlineWidth: 2,
			},
			label: {
				text: row.name,
				font: '600 13px sans-serif',
				fillColor: Cesium.Color.WHITE,
				outlineColor: Cesium.Color.BLACK,
				outlineWidth: 3,
				style: Cesium.LabelStyle.FILL_AND_OUTLINE,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				pixelOffset: new Cesium.Cartesian2(0, -14),
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
				disableDepthTestDistance: Number.POSITIVE_INFINITY,
				show: true,
			},
		} as any);
	}

	if (points.length < 3) return null;
	// polygon 的 hierarchy 必须是 Cartesian3；用 CallbackProperty 保证后续可动态改点
	const cartesians = points.map((p) => Cesium.Cartesian3.fromDegrees(p[0], p[1], 0));
	return viewer.entities.add({
		id,
		name: row.name,
		polygon: {
			hierarchy: cartesians as any,
			material: base.withAlpha(alpha),
			outline: true,
			outlineColor: outline,
			outlineWidth: 2,
		},
		label: {
			text: row.name,
			font: '600 13px sans-serif',
			fillColor: Cesium.Color.WHITE,
			outlineColor: Cesium.Color.BLACK,
			outlineWidth: 3,
			style: Cesium.LabelStyle.FILL_AND_OUTLINE,
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			pixelOffset: new Cesium.Cartesian2(0, -14),
			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			disableDepthTestDistance: Number.POSITIVE_INFINITY,
			show: true,
		},
	} as any);
}

export function removeZone(id: number | string) {
	const viewer: Cesium.Viewer = (window as any).viewer;
	if (!viewer) return;
	const entityId = `${ENTITY_PREFIX}${id}`;
	if (viewer.entities.getById(entityId)) viewer.entities.removeById(entityId);
}

/** 清空本图层所有实体（不影响其它图层） */
export function clearZones() {
	const viewer: Cesium.Viewer = (window as any).viewer;
	if (!viewer) return;
	const ids = viewer.entities.values.filter((e: Cesium.Entity) => String(e.id).startsWith(ENTITY_PREFIX)).map((e: Cesium.Entity) => e.id);
	ids.forEach((i) => viewer.entities.removeById(i));
}

export function flyToZone(id: number, opts: { zoom?: number } = {}) {
	const viewer: Cesium.Viewer = (window as any).viewer;
	if (!viewer) return;
	const entity = viewer.entities.getById(`${ENTITY_PREFIX}${id}`);
	console.log('flyToZone-entityentityentity:', entity);

	if (!entity) return;
	viewer.flyTo(entity, { duration: 1.2, offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-55), opts.zoom ?? 1200) });
}

/** 屏幕坐标 → 经纬度（地形与椭球都尝试，保证有地形时也不飘） */
export function pickLonLat(movement: any): [number, number] | null {
	const viewer: Cesium.Viewer = (window as any).viewer;
	if (!viewer) return null;
	const cartesian = viewer.scene.pickPosition?.(movement.position) ?? viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
	if (!cartesian) return null;
	const carto = Cesium.Cartographic.fromCartesian(cartesian);
	return [Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude)];
}

// ------------------------------------------------------------------ 交互式绘制

type DrawMode = 'polygon' | 'circle';
let activeHandler: Cesium.ScreenSpaceEventHandler | null = null;
let previewEntity: Cesium.Entity | null = null;
let draftPoints: [number, number][] = [];
let currentMode: DrawMode | null = null;
/** 多边形绘制时光标位置，用于画「橡皮筋」引导线 */
let rubberPoint: [number, number] | null = null;

export function isDrawing() {
	return currentMode !== null;
}

export function getDraftPoints() {
	return [...draftPoints];
}

/** 正在画的圆的半径（米）；非圆形绘制时为 0 */
export function getDraftRadius(): number {
	if (currentMode !== 'circle' || draftPoints.length < 2) return 0;
	const [lon1, lat1] = draftPoints[0];
	const [lon2, lat2] = draftPoints[draftPoints.length - 1];
	return Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(lon1, lat1, 0), Cesium.Cartesian3.fromDegrees(lon2, lat2, 0));
}

function clearPreview() {
	const viewer: Cesium.Viewer = (window as any).viewer;
	if (previewEntity && viewer) viewer.entities.remove(previewEntity);
	if (viewer) {
		const rubber = viewer.entities.getById('flyzone-preview-rubber');
		if (rubber) viewer.entities.remove(rubber);
	}
	previewEntity = null;
}

/** 画预览：多边形用折线+面，圆用动态 ellipse */
function refreshPreview() {
	const viewer: Cesium.Viewer = (window as any).viewer;
	if (!viewer) return;
	clearPreview();

	if (currentMode === 'circle') {
		if (draftPoints.length === 0) return;
		const [lon, lat] = draftPoints[0];
		const radius = Math.max(getDraftRadius(), 10);
		previewEntity = viewer.entities.add({
			id: 'flyzone-preview',
			position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
			ellipse: {
				semiMinorAxis: radius,
				semiMajorAxis: radius,
				material: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.25),
				outline: true,
				outlineColor: Cesium.Color.fromCssColorString('#38bdf8'),
				outlineWidth: 2,
			},
		});
		return;
	}

	if (draftPoints.length < 2) return;
	const previewColor = Cesium.Color.fromCssColorString('#38bdf8');
	const cartesians = draftPoints.map((p) => Cesium.Cartesian3.fromDegrees(p[0], p[1], 0));
	// 用 polygon（而非 polyline）：Cesium 会自动闭合首尾，渲染成「闭合面 + 闭合轮廓」，
	// 不会像开放折线那样看起来是一段段散开的线段
	previewEntity = viewer.entities.add({
		id: 'flyzone-preview',
		polygon: {
			hierarchy: cartesians as any,
			material: previewColor.withAlpha(0.18),
			outline: true,
			outlineColor: previewColor,
			outlineWidth: 2,
		},
	});
	// 橡皮筋：从最后一个已定点连到光标，方便看清下一段会落到哪
	if (rubberPoint) {
		const cur = Cesium.Cartesian3.fromDegrees(rubberPoint[0], rubberPoint[1], 0);
		viewer.entities.add({
			id: 'flyzone-preview-rubber',
			polyline: {
				positions: [cartesians[cartesians.length - 1], cur],
				width: 2,
				material: previewColor.withAlpha(0.6),
				clampToGround: true,
			},
		});
	}
}

/**
 * 开始绘制。
 *
 * @param mode polygon：连续点选顶点；circle：第一次点选圆心，之后移动鼠标预览半径再点一次确定
 * @param onFinish 完成时回调（多边形给顶点数组，圆形给 [圆心] 与半径）
 */
export function startDraw(mode: DrawMode, onFinish: (points: [number, number][], radius: number) => void) {
	const viewer: Cesium.Viewer = (window as any).viewer;
	if (!viewer || activeHandler) return;

	stopDraw();
	currentMode = mode;
	draftPoints = [];

	activeHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

	activeHandler.setInputAction((movement: any) => {
		const lonLat = pickLonLat(movement);
		if (!lonLat) return;
		draftPoints.push(lonLat);
		// 圆只需要圆心 + 一次半径确认，第二次点击即结束
		if (mode === 'circle' && draftPoints.length === 2) {
			const radius = getDraftRadius();
			const center = draftPoints[0];
			stopDraw();
			onFinish([center], radius);
			return;
		}
		refreshPreview();
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	activeHandler.setInputAction((movement: any) => {
		if (mode === 'circle') {
			if (draftPoints.length !== 1) return;
			const lonLat = pickLonLat({ position: movement.endPosition });
			if (!lonLat) return;
			draftPoints = [draftPoints[0], lonLat];
			refreshPreview();
			return;
		}
		// polygon：更新橡皮筋引导线，跟着光标走
		const lonLat = pickLonLat({ position: movement.endPosition });
		if (!lonLat) return;
		rubberPoint = lonLat;
		refreshPreview();
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

/** 结束当前绘制并清理预览（不会触发完成回调） */
export function stopDraw() {
	if (activeHandler) {
		activeHandler.destroy();
		activeHandler = null;
	}
	currentMode = null;
	draftPoints = [];
	rubberPoint = null;
	clearPreview();
}

/** 回车/「完成」按钮：产出当前草稿。多边形不足 3 点会被拒绝（返回 null） */
export function commitDraw(): { points: [number, number][]; radius: number } | null {
	if (currentMode === 'polygon') {
		if (draftPoints.length < 3) return null;
		const pts = [...draftPoints];
		stopDraw();
		return { points: pts, radius: 0 };
	}
	if (currentMode === 'circle') {
		const pts = [...draftPoints];
		const radius = getDraftRadius();
		stopDraw();
		return pts.length ? { points: [pts[0]], radius } : null;
	}
	return null;
}

/** 撤销最后一个顶点 */
export function undoPoint() {
	if (currentMode !== 'polygon' || draftPoints.length === 0) return;
	draftPoints.pop();
	refreshPreview();
}

/** 面积/周长：圆形按半径算，多边形按球面算 —— 与后端同一套口径，避免前后端数值对不上 */
export function measure(points: [number, number][], shape: number, radius: number) {
	if (shape === FlyZoneShape.Circle) {
		if (radius <= 0) return { area: 0, perimeter: 0 };
		return { area: Math.PI * radius * radius, perimeter: 2 * Math.PI * radius };
	}
	if (points.length < 3) return { area: 0, perimeter: 0 };
	const R = 6371008.8;
	const rad = (d: number) => (d * Math.PI) / 180;
	let sum = 0;
	let perimeter = 0;
	for (let i = 0; i < points.length; i++) {
		const a = points[i];
		const b = points[(i + 1) % points.length];
		sum += rad(b[0] - a[0]) * (2 + Math.sin(rad(a[1])) + Math.sin(rad(b[1])));
		const dLat = rad(b[1] - a[1]);
		const dLon = rad(b[0] - a[0]);
		const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
		perimeter += 2 * R * Math.asin(Math.sqrt(h));
	}
	return { area: Math.abs((sum * R * R) / 2), perimeter };
}

/** 判断点是否落在多边形内（射线法）。用于「机场是否在作业区内」这类即时校验 */
export function pointInPolygon(lon: number, lat: number, points: [number, number][]): boolean {
	let inside = false;
	for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
		const [xi, yi] = points[i];
		const [xj, yj] = points[j];
		const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
}
