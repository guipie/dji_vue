// cesium地图初始化
import * as Cesium from 'cesium';
import { mouseClickHandle } from './mouseClickHandle';
export async function initCesium(options?: any) {
	function hideLoadingOverlay() {
		const loadingOverlay = document.getElementById('loadingOverlay')!;
		// 先设置透明度为0，实现平滑过渡，再移除元素
		loadingOverlay.style.opacity = '0';
		setTimeout(() => {
			loadingOverlay.style.display = 'none';
			// 可选：彻底从DOM中移除
			// loadingOverlay.remove();
		}, 500); // 与CSS中的transition时长一致
	}

	// 可选：设置超时保护，防止加载事件未触发导致动画一直显示
	setTimeout(() => {
		hideLoadingOverlay();
	}, 10000); // 10秒后强制隐藏
	Cesium.Ion.defaultAccessToken =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZjA0Mjc1OC02N2YwLTQzODAtYjY3Mi05ZThlN2YzNDY1NTEiLCJpZCI6MzYwODUxLCJpYXQiOjE3NjMyOTg4ODZ9.AKRDep447XQx5mJdGGNVr5SPeAUqQ16mioHdi1mw_YI';

	window.viewer = new Cesium.Viewer('cesiumContainer', {
		// 地形提供者
		terrainProvider: await Cesium.createWorldTerrainAsync(),
		// 控制UI组件显示
		timeline: false, // 时间轴
		animation: false, // 动画控件
		sceneModePicker: false, // 场景模式选择器
		baseLayerPicker: false, // 底图选择器
		navigationHelpButton: false, // 导航帮助按钮
		homeButton: false, // 主页按钮
		geocoder: false, // 地理编码搜索框
		infoBox: false, // 信息框  如果控制台报错，可以先关了这个
		// projectionPicker: true, //是否显示投影选择器
		// skyBox: false, //天空盒设置，用于显示星空背景
		selectionIndicator: false, //是否显示选择指示器
		// 其他选项
		shouldAnimate: true, // 自动动画
		skyAtmosphere: false, // 关闭大气效果

		// fog: false, // 关闭雾效
		orderIndependentTranslucency: false,
		contextOptions: {
			// 创建一个WebGL上下文，用于Cesium的渲染
			webgl: {
				alpha: true,
			},
		},
	});
	// 添加自定义影像图层
	const imageryProvider = new Cesium.UrlTemplateImageryProvider({
		url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
		maximumLevel: 18,
		minimumLevel: 1,
		credit: 'Amap',
	});
	// 添加图层并获取图层对象
	const imageryLayer = window.viewer.imageryLayers.addImageryProvider(imageryProvider);
	// 使用viewer的tileLoadProgress事件来监听加载状态
	const removeCallback = window.viewer.scene.globe.tileLoadProgressEvent.addEventListener((progress) => {
		if (progress > 0) {
			// 所有瓦片加载完成
			console.log('底图加载完成');
			hideLoadingOverlay(); // 隐藏加载动画
			// 移除事件监听器
			removeCallback();
		}
	});
	// const canvas = document.getElementById('cesiumContainer') as HTMLCanvasElement;
	// // 使用原生 getContext 并手动传递 willReadFrequently
	// const context = canvas.getContext('2d', { willReadFrequently: true });
	document.body.style.backgroundColor = 'transparent';
	document.getElementsByClassName('cesium-viewer-bottom')[0].remove();
	//Enable lighting based on the sun position
	window.viewer.scene.globe.enableLighting = true;

	//Enable depth testing so things behind the terrain disappear.
	window.viewer.scene.globe.depthTestAgainstTerrain = true;
	const canvas = window.viewer.canvas as HTMLCanvasElement;
	// const gl = canvas!.getContext('webgl2'); // 强制使用WebGL 2.0
	const context = canvas.getContext('2d', { willReadFrequently: true });
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
	// 5. 监听相机变化事件
	window.viewer.scene.camera.changed.addEventListener(function () {
		console.log('相机位置:', window.viewer.scene.camera.positionCartographic);
	});
	if (options.inited) {
		options.inited();
	}
	navigator.geolocation.getCurrentPosition(
		function (position) {
			// 设置初始视角
			window.viewer.camera.setView({
				destination: Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, 2000),
			});
		},
		function (e) {
			throw e.message;
		}
	);
	// 6. 监听鼠标事件
	window.viewer.screenSpaceEventHandler.setInputAction(function (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
		//鼠标点击entity获取entity信息
		const pickedObject = window.viewer.scene.pick(movement.position);
		if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
			const entity = pickedObject.id;
			mouseClickHandle({ longitude: 0, latitude: 0, height: 0, entity: entity });
			return;
		}
		// 获取笛卡尔坐标
		const pickRay = window.viewer.camera.getPickRay(movement.position);
		if (pickRay) {
			// 获取笛卡尔坐标
			const cartesian = window.viewer.scene.globe.pick(pickRay, window.viewer.scene);

			if (cartesian) {
				// 转换为经纬度坐标（弧度）
				const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
				// 转换为度数
				const longitude = Cesium.Math.toDegrees(cartographic.longitude);
				const latitude = Cesium.Math.toDegrees(cartographic.latitude);
				const height = cartographic.height; // 高度
				console.log('经度:', longitude, '纬度:', latitude, '高度:', height);
				mouseClickHandle({ longitude, latitude, height, entity: null });
			} else {
				console.log('未能获取到地面坐标');
				alert('未能获取到地面坐标');
			}
		} else {
			console.log('未能获取到地面坐标');
			alert('未能获取到地面坐标');
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	// window.viewer.screenSpaceEventHandler.setInputAction(function (movement: any) {
	// 	console.log('鼠标点击:', movement.position);
	// }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	// window.viewer.screenSpaceEventHandler.setInputAction(function (movement: any) {
	// 	console.log('鼠标双击:', movement.position);
	// }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	// window.viewer.screenSpaceEventHandler.setInputAction(function (movement: any) {
	// 	console.log('鼠标滚轮:', movement.amount);
	// }, Cesium.ScreenSpaceEventType.WHEEL);
}

// =============== 飞向某个坐标点 ===============
export function flyTo(longitude: number, latitude: number, height: number) {
	window.viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
		orientation: {
			heading: Cesium.Math.toRadians(0.0), // 方向角
			pitch: Cesium.Math.toRadians(-45.0), // 俯仰角
			roll: 0.0, // 翻滚角
		},
		duration: 2,
		complete: function () {
			console.log('飞向完成');
		},
		easingFunction: Cesium.EasingFunction.LINEAR_NONE,
	});
}

// =============== 飞向某个entity ===============
export function flyToEntity(entity: Cesium.Entity) {
	window.viewer.flyTo(entity, {
		offset: new Cesium.HeadingPitchRange(
			0.0, // heading: 朝北
			-Cesium.Math.toRadians(45), // pitch: 向下45度（也可写成 Math.PI / 4）
			200 // range: 距离目标200米
		),
		duration: 2,
	});
}

// 创建一个canvas元素并绘制实心点和文字
export function canvasPointWithText(text: string, color: string) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d')!;
	var size = 36; // 图标大小
	canvas.width = size;
	canvas.height = size;

	// 绘制实心点
	context.beginPath();
	context.arc(size / 2, size / 2, (size - 4) / 2, 0, Math.PI * 2, true);
	context.closePath();
	context.fillStyle = color || 'red'; // 点的颜色
	context.fill();

	// 在圆心绘制文字
	context.font = 'bold 18px sans-serif';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillStyle = '#ffffff'; // 文字颜色
	context.fillText(text, size / 2, size / 2);

	return canvas.toDataURL(); // 返回数据URL
}
