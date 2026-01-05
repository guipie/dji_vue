import * as Cesium from 'cesium';
import { flyTo } from './viewerFuncs';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { drawWayline } from './waylineUtil';
import { ElMessageBox } from 'element-plus';
import { getLeftClickMouse } from '../data/svgDataHelper';
const waylineStore = useWaylineStore();
interface ContextOptions {
	/** 鼠标右键点击的坐标 */
	longitude?: number;
	latitude?: number;
	num?: number;
	clientX: number;
	clientY: number;
	entity?: Cesium.Entity | null;
}
interface ContextMenuItem {
	label: string;
	icon?: string; // 可选图标类名（如使用 Iconify 或 ElIcon）
	action: (options: ContextOptions) => void;
}
const items = (options: ContextOptions): ContextMenuItem[] => {
	const data = [];
	const index = options.num;
	if (index && index > 0) {
		data.push({
			label: `在 ${index} 号航点前插入航点`,
			action: () => {
				if (options.num && options.num > 0) {
					waylineStore.setWaylinePoint(options.longitude!, options.latitude!, options.num! - 1);
					drawWayline();
				}
			},
		});
		data.push({
			label: `在 ${index} 号航点后插入航点`,
			action: () => {
				if (options.num && options.num > 0) {
					waylineStore.setWaylinePoint(options.longitude!, options.latitude!, options.num!);
					drawWayline();
				}
			},
		});
		data.push({ label: `删除${index}号航点`, action: () => {} });
	} else {
		data.push({
			label: '新增航点',
			action: () => {
				var homeCoord = waylineStore.$state.curCreateWaylineExt.homeCoordinate;
				if (homeCoord && homeCoord.longitude > 0 && homeCoord.latitude > 0) {
					waylineStore.setWaylinePoint(options.longitude!, options.latitude!);
					drawWayline();
				} else {
					ElMessageBox.alert('请先设置航线的起飞点坐标', '提示');
				}
			},
		});
	}
	data.push({
		label: '飞到此处',
		action: (options: ContextOptions) => {
			flyTo(options.entity ?? [options.longitude!, options.latitude!]);
		},
	});
	return data;
};
export class CesiumContextMenu {
	private viewer: Cesium.Viewer;
	private tooltipDiv: HTMLDivElement | null = null;
	private contextMenuDiv: HTMLDivElement | null = null;
	private hoveredEntity: Cesium.Entity | null = null;
	private rightClickedEntity: Cesium.Entity | null = null;

	constructor(viewer: Cesium.Viewer) {
		this.viewer = viewer;
		this.initTooltip();
		this.bindEvents();
	}

	private initTooltip() {
		this.tooltipDiv = document.createElement('div');
		// 使用 UnoCSS 类 + 自定义变量
		this.tooltipDiv.className = 'fixed z-50 hidden px-3 text-xs text-white rounded-lg shadow-lg transition-opacity duration-200';
		this.tooltipDiv.style.backgroundColor = 'var(--el-color-primary)';
		this.tooltipDiv.style.opacity = '0.9';
		document.body.appendChild(this.tooltipDiv);
	}

	private initContextMenu(options: ContextOptions) {
		if (!this.contextMenuDiv) {
			this.contextMenuDiv = document.createElement('div');
			this.contextMenuDiv.id = 'mapContextMenu';
			this.contextMenuDiv.className = 'fixed z-50 hidden flex-col rounded-lg shadow-xl overflow-hidden border border-gray-200 animate-fade-in';
		} else {
			this.contextMenuDiv.innerHTML = ''; // 清空内容
		}
		console.log('waylineStore.$state.selectedPointIndex', waylineStore.$state.selectedPointIndex);

		options.num = (waylineStore.$state.selectedPointIndex ?? 0) > 0 ? waylineStore.$state.selectedPointIndex! + 1 : waylineStore.$state.curCreateWayline.folder.placemarks?.length;
		if (!options.longitude || !options.latitude) return;
		items(options).forEach((item) => {
			const btn = document.createElement('div');
			btn.className = 'text-lg text-white hover:bg-gray-50 transition-colors duration-150 cursor-pointer';
			btn.innerText = item.label;

			btn.onmouseenter = () => {
				btn.style.backgroundColor = 'var(--el-color-primary-light-5)';
				btn.style.color = 'var(--el-color-primary)';
			};
			btn.onmouseleave = () => {
				btn.style.backgroundColor = '';
				btn.style.color = '';
			};

			btn.onclick = (e) => {
				e.stopPropagation();
				item.action(options);
				this.hideContextMenu();
			};
			this.contextMenuDiv!.appendChild(btn);
		});
		// 点击外部关闭
		const handleClickOutside = (e: MouseEvent) => {
			if (this.contextMenuDiv && !this.contextMenuDiv.contains(e.target as Node)) {
				this.hideContextMenu();
			}
		};
		document.addEventListener('click', handleClickOutside);
		// 存储监听器以便销毁时移除（简化起见这里略，实际项目建议存引用）

		document.body.appendChild(this.contextMenuDiv);
	}

	private bindEvents() {
		const canvas = this.viewer.canvas;

		// 鼠标移动：仅当 pick 到 entity 时显示 tooltip
		canvas.addEventListener('mousemove', (e) => {
			// console.log('mousemove', e);
			const mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY);
			const pickedObject = this.viewer.scene.pick(mousePosition);
			if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
				const entity = pickedObject.id;
				if (entity !== this.hoveredEntity) {
					this.hoveredEntity = entity;
					this.showTooltip(e.clientX, e.clientY, entity);
					canvas.style.cursor = 'pointer';
				}
			} else {
				if (this.hoveredEntity !== null) {
					this.hoveredEntity = null;
					this.hideTooltip();
					canvas.style.cursor = 'default';
				}
			}
		});

		canvas.addEventListener('mouseleave', () => {
			this.hoveredEntity = null;
			this.hideTooltip();
			// canvas.style.cursor = 'default';
		});

		// 右键：记录点击的 entity，并弹出菜单
		canvas.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			const mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY);
			const pickedObject = this.viewer.scene.pick(mousePosition);
			const options: ContextOptions = { clientX: 0, clientY: 0 };
			// 获取地理坐标
			const ray = this.viewer.camera.getPickRay(mousePosition);
			console.log('右键点击:', e);
			if (ray) {
				const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
				if (cartesian) {
					const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
					const longitude = Cesium.Math.toDegrees(cartographic.longitude);
					const latitude = Cesium.Math.toDegrees(cartographic.latitude);
					options.longitude = longitude;
					options.latitude = latitude;
					console.log(`右键点击地理坐标: 经度=${longitude}, 纬度=${latitude}`);
				}
			}
			this.rightClickedEntity = Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) ? pickedObject.id : null;
			options.entity = this.rightClickedEntity;
			options.clientX = e.clientX;
			options.clientY = e.clientY;
			if (this.rightClickedEntity) {
				console.log('右键点击:', this.rightClickedEntity);
			}
			this.showContextMenu(options);
		});
	}

	private showTooltip(x: number, y: number, entity: Cesium.Entity) {
		if (!this.tooltipDiv) return;
		this.tooltipDiv.style.left = `${x + 12}px`;
		this.tooltipDiv.style.top = `${y + 12}px`;
		if (entity.properties && entity.properties.isWaylinePoint) {
			var moveDiv = `<div class="flex-center m-2"><div>${getLeftClickMouse}</div><div>按住鼠标拖拽水平移动位置</div></div>`;
			var upDownDiv = `<div class="flex-center"><div style="margin-left: 4px;">[Shift] +</div><div>${getLeftClickMouse}</div><div>按住鼠标拖拽水平移动位置</div></div>`;
			// const cartographic = Cesium.Cartographic.fromCartesian(entity.position!.getValue(Cesium.JulianDate.now())!);
			// var heightDiv = `<div class="flex-center m-2"><div>高度:</div><div>${cartographic.height}</div></div>`;
			this.tooltipDiv.innerHTML = `<div style="padding:4px;">${moveDiv + upDownDiv}</div>`;
		}
		this.tooltipDiv.classList.remove('hidden');
	}

	private hideTooltip() {
		this.tooltipDiv?.classList.add('hidden');
	}

	private showContextMenu(options: ContextOptions) {
		// if (!this.contextMenuDiv) return;
		this.initContextMenu(options);

		// 防止菜单超出视口（简单处理）
		const rect = this.contextMenuDiv!.getBoundingClientRect();
		let left = options.clientX;
		let top = options.clientY;
		if (options.clientX + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 5;
		if (options.clientY + rect.height > window.innerHeight) top = window.innerHeight - rect.height - 5;

		this.contextMenuDiv!.style.left = `${left}px`;
		this.contextMenuDiv!.style.top = `${top}px`;
		this.contextMenuDiv!.classList.remove('hidden');
	}

	private hideContextMenu() {
		this.contextMenuDiv?.classList.add('hidden');
		this.rightClickedEntity = null;
	}

	public destroy() {
		this.hideTooltip();
		this.hideContextMenu();
		if (this.tooltipDiv) {
			document.body.removeChild(this.tooltipDiv);
			this.tooltipDiv = null;
		}
		if (this.contextMenuDiv) {
			document.body.removeChild(this.contextMenuDiv);
			this.contextMenuDiv = null;
		}
		// 注意：若添加了全局事件监听，应在此移除
	}
}
