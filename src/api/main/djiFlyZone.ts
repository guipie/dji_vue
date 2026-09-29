import request from '/@/utils/request';

/**
 * 飞行区 / 禁飞区（运营端在地图上自绘的空域）。
 *
 * 与 `djiFlightArea` 的关系要分清：
 *   - **本接口**管的是「画了哪些区域」—— 几何数据、名称、类型、限高、启停
 *   - `djiFlightArea` 管的是「哪些文件下发到了哪台机场」—— 文件台账与设备同步状态
 * 二者通过 `Export` 衔接：这里导出符合大疆协议的文件内容 → 上传 → 去那边登记下发。
 */
enum Api {
	Page = '/api/djiFlyZone/page',
	List = '/api/djiFlyZone/list',
	Detail = '/api/djiFlyZone/detail',
	Add = '/api/djiFlyZone/add',
	Update = '/api/djiFlyZone/update',
	Delete = '/api/djiFlyZone/delete',
	SetEnabled = '/api/djiFlyZone/setEnabled',
	Export = '/api/djiFlyZone/export',
}

/** 后端枚举 FlyZoneTypeEnum：0 作业区（圈内可飞） / 1 禁飞区（圈外可飞） */
export const FlyZoneType = { CustomFlyZone: 0, NoFlyZone: 1 } as const;

/** 后端枚举 FlyZoneShapeEnum：0 多边形 / 1 圆形 */
export const FlyZoneShape = { Polygon: 0, Circle: 1 } as const;

/** GeoJSON 的 geometry 片段 */
export interface FlyZoneGeometry {
	type: 'Polygon' | 'Point';
	/** Polygon: [[[lon,lat],...]]；Point: 由 coordinates 直接是 [lon,lat]，为兼容统一按嵌套读取 */
	coordinates: any;
}

export interface FlyZoneRow {
	id: number;
	workspaceId?: string;
	name: string;
	zoneType: number;
	zoneTypeName?: string;
	shape: number;
	shapeName?: string;
	/** GeoJSON geometry 原串，可 JSON.parse 后直接给地图用 */
	geometry: string;
	radius: number;
	minHeight: number;
	maxHeight: number;
	color?: string;
	isEnabled: boolean;
	sort: number;
	remark?: string;
	createTime?: string;
	/** 后端按球面公式算好的面积（m²） */
	areaSquareMeters: number;
	perimeterMeters: number;
	vertexCount: number;
}

/** 地图一次加载全部区域（数量可预期，分页反而难用） */
export const listDjiFlyZone = (workspaceId?: string) =>
	request({ url: Api.List, method: 'get', data: { workspaceId } });

export const pageDjiFlyZone = (params?: any) => request({ url: Api.Page, method: 'post', data: params });

export const detailDjiFlyZone = (id: number) => request({ url: Api.Detail, method: 'get', data: { id } });

export interface FlyZoneGeometryInput {
	/** 'Polygon' 或 'Point'（圆形） */
	type: 'Polygon' | 'Point';
	/**
	 * 扁平的点列表 —— 多边形与圆形共用同一形状，避免区分嵌套层级。
	 *   多边形：[[lon,lat],[lon,lat],...]  至少 3 个、至多 255 个
	 *   圆形：  [[lon,lat]]              只取第一个点作圆心
	 */
	coordinates: number[][];
}

export interface FlyZoneUpsert {
	id?: number;
	workspaceId?: string;
	name: string;
	zoneType: number;
	shape: number;
	geometry: FlyZoneGeometryInput;
	radius?: number;
	minHeight?: number;
	maxHeight?: number;
	color?: string;
	isEnabled?: boolean;
	sort?: number;
	remark?: string;
}

export const addDjiFlyZone = (params: FlyZoneUpsert) => request({ url: Api.Add, method: 'post', data: params });

export const updateDjiFlyZone = (params: FlyZoneUpsert) => request({ url: Api.Update, method: 'post', data: params });

export const deleteDjiFlyZone = (ids: (number | string)[]) =>
	request({ url: Api.Delete, method: 'post', data: { ids } });

export const setEnabledDjiFlyZone = (ids: (number | string)[], isEnabled: boolean) =>
	request({ url: Api.SetEnabled, method: 'post', data: { ids, isEnabled } });

/**
 * 导出符合大疆协议的自定义飞行区文件。
 *
 * 注意 `validations`：后端会逐区域给出是否合规及原因。
 * 违反协议（圆半径 < 10m、多边形顶点 > 255）的区域**不会**被写入 features，
 * 但会出现在 validations 里 —— 前端必须把它显示出来，否则用户会以为导出全量成功。
 */
export const exportDjiFlyZone = (workspaceId?: string) =>
	request({ url: Api.Export, method: 'get', data: { workspaceId } });
