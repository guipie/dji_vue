// CesiumDrawer.ts
import * as Cesium from 'cesium';
import * as svg from '@element-plus/icons-vue';

// =============== Point ===============
export interface DrawPointOptions {
	/** [经度, 纬度, 高度?] */
	position: [number, number, number?];
	/** 点图形样式 */
	pointStyle?: Cesium.PointGraphics.ConstructorOptions;
	/** 文本内容（可选） */
	labelText?: string;
	/** 文本样式 */
	labelStyle?: Cesium.LabelGraphics.ConstructorOptions;
	/** 实体 ID */
	id?: string;
	/** 实体名称 */
	name?: string;
	svgUrl?: string;
	svgSize?: number;
	properties?: { [key: string]: any };
}

export function drawPoint(options: DrawPointOptions): Cesium.Entity {
	const viewer: Cesium.Viewer = window.viewer;
	const { svgSize, svgUrl, position, pointStyle, properties, labelText, labelStyle, id, name = 'pointEntity' } = options;

	const [lon, lat, height = 0] = position;
	const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, height);

	// 默认点样式
	const defaultPointStyle: Cesium.PointGraphics.ConstructorOptions = {
		pixelSize: 8,
		color: Cesium.Color.DODGERBLUE,
		outlineColor: Cesium.Color.WHITE,
		outlineWidth: 2,
		heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 让在地形上紧贴
		// disableDepthTestDistance: Number.POSITIVE_INFINITY, //深度测试
	};

	// 默认文本样式
	const defaultLabelStyle: Cesium.LabelGraphics.ConstructorOptions = {
		show: true,
		text: labelText || '',
		font: '14px sans-serif',
		fillColor: Cesium.Color.WHITE,
		outlineColor: Cesium.Color.WHITE,
		outlineWidth: 2,
		style: Cesium.LabelStyle.FILL_AND_OUTLINE,
		verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
		pixelOffset: new Cesium.Cartesian2(0, 6),
		heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 让在地形上紧贴
		disableDepthTestDistance: Number.POSITIVE_INFINITY,
	};

	var billboard: Cesium.BillboardGraphics | Cesium.BillboardGraphics.ConstructorOptions | undefined = undefined;
	if (svgUrl) {
		billboard = {
			// heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 让在地形上紧贴
			image: svgUrl,
			scale: (svgSize ?? 24) / 24,
			pixelOffset: new Cesium.Cartesian2(0, 0),
			verticalOrigin: Cesium.VerticalOrigin.CENTER,
			horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			disableDepthTestDistance: Number.POSITIVE_INFINITY,
			...pointStyle,
		};
	}
	const entity = new Cesium.Entity({
		id,
		name,
		position: cartesian,
		billboard: billboard,
		properties,
		point: svgUrl ? undefined : { ...defaultPointStyle, ...pointStyle },
		label: labelText ? { ...defaultLabelStyle, ...labelStyle, text: labelText } : undefined,
	});
	viewer.entities.add(entity);
	return entity;
}

// =============== Polyline ===============
export interface DrawPolylineOptions {
	/** [[lon1, lat1, height?], [lon2, lat2, height?], ...] */
	positions: [number, number, number?][];
	/** 折线样式 */
	polylineStyle?: Cesium.PolylineGraphics.ConstructorOptions;
	id?: string;
	name?: string;
	properties?: { [key: string]: any };
}

export function drawPolyline(options: DrawPolylineOptions): Cesium.Entity {
	const { positions, polylineStyle, id = 'waylinePolyline', name = 'waylinePolyline', properties } = options;

	if (positions.length < 2) {
		throw new Error('Polyline requires at least two points: [[lon1, lat1, height?], [lon2, lat2, height?]]');
	}

	const cartesianPositions: Cesium.Cartesian3[] = [];

	// 处理二维数组格式 [[lon, lat, height], [lon, lat, height], ...]
	for (const pos of positions) {
		if (Array.isArray(pos) && pos.length >= 2) {
			const lon = pos[0];
			const lat = pos[1];
			const height = pos.length > 2 ? pos[2] : 0;
			cartesianPositions.push(Cesium.Cartesian3.fromDegrees(lon, lat, height));
		} else {
			throw new Error('Invalid position format, expected [lon, lat, height?]');
		}
	}

	const defaultPolylineStyle: Cesium.PolylineGraphics.ConstructorOptions = {
		width: 4,
		material: Cesium.Color.DODGERBLUE.withAlpha(0.8),
		clampToGround: false, // 确保线贴合地面
	};
	var entity = window.viewer.entities.getById(id);
	console.log('是否存在航线', !!entity);

	if (entity) {
		entity.polyline!.positions = new Cesium.CallbackProperty(() => cartesianPositions, false);
	} else {
		entity = new Cesium.Entity({
			id,
			name,
			properties,
			polyline: {
				positions: new Cesium.CallbackProperty(() => cartesianPositions, false),
				...defaultPolylineStyle,
				...polylineStyle,
			},
		});
		window.viewer.entities.add(entity);
	}
	return entity;
}

// =============== Polygon ===============
export interface DrawPolygonOptions {
	/** [lon1, lat1, lon2, lat2, ..., lonN, latN] */
	positions: number[];
	/** 多边形样式 */
	polygonStyle?: Cesium.PolygonGraphics.ConstructorOptions;
	id?: string;
	name?: string;
	properties?: { [key: string]: any };
}

export function drawPolygon(options: DrawPolygonOptions): Cesium.Entity {
	const { positions, polygonStyle, id, name = 'polygon entity', properties } = options;
	if (positions.length < 6) {
		throw new Error('Polygon requires at least three points: [lon1, lat1, lon2, lat2, lon3, lat3]');
	}

	const cartesianPositions: Cesium.Cartesian3[] = [];
	for (let i = 0; i < positions.length; i += 2) {
		const lon = positions[i];
		const lat = positions[i + 1];
		const height = i + 2 < positions.length ? positions[i + 2] : 0;
		cartesianPositions.push(Cesium.Cartesian3.fromDegrees(lon, lat, height));
	}

	const defaultPolygonStyle: Cesium.PolygonGraphics.ConstructorOptions = {
		material: Cesium.Color.DODGERBLUE.withAlpha(0.4),
		outline: true,
		outlineColor: Cesium.Color.DODGERBLUE,
		outlineWidth: 2,
		// clampToGround: true,
	};

	const entity = new Cesium.Entity({
		id,
		name,
		properties,
		polygon: {
			hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(cartesianPositions), false),
			...defaultPolygonStyle,
			...polygonStyle,
		},
	});

	window.viewer.entities.add(entity);
	return entity;
}
