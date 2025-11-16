// cesium地图初始化
import * as Cesium from 'cesium';
export function initCesium() {
	Cesium.Ion.defaultAccessToken =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZjA0Mjc1OC02N2YwLTQzODAtYjY3Mi05ZThlN2YzNDY1NTEiLCJpZCI6MzYwODUxLCJpYXQiOjE3NjMyOTg4ODZ9.AKRDep447XQx5mJdGGNVr5SPeAUqQ16mioHdi1mw_YI';
	window.viewer = new Cesium.Viewer('cesiumContainer', {
		// 地形提供者
		terrainProvider: Cesium.createWorldTerrain(),

		// 基础图层
		imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
			url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
		}),

		// 控制UI组件显示
		timeline: false, // 时间轴
		animation: false, // 动画控件
		sceneModePicker: false, // 场景模式选择器
		baseLayerPicker: false, // 底图选择器
		navigationHelpButton: false, // 导航帮助按钮
		homeButton: false, // 主页按钮
		geocoder: false, // 地理编码搜索框
		infoBox: true, // 信息框  如果控制台报错，可以先关了这个
		// 其他选项
		shouldAnimate: true, // 自动动画
		skyAtmosphere: false, // 关闭大气效果
		// fog: false, // 关闭雾效
		orderIndependentTranslucency: false,
		contextOptions: {
			webgl: {
				alpha: true,
			},
		},
	});
	// 设置初始视角
	window.viewer.camera.setView({
		destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 100000),
	});
	// 1. 启用调试图层
	window.viewer.scene.debugShowFramesPerSecond = true;

	// 2. 监听错误事件
	window.viewer.scene.renderError.addEventListener(function (error) {
		console.error('渲染错误:', error);
	});

	// 3. 检查WebGL支持
	if (!Cesium.FeatureDetection.supportsWebAssembly()) {
		alert('您的浏览器不支持WebGL');
	}
	// 4. 检查地形和影像加载状态
	window.viewer.scene.globe.tileLoadProgressEvent.addEventListener(function (remaining) {
		console.log('剩余加载瓦片:', remaining);
	});
}
