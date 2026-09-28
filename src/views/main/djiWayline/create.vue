<template>
	<div class="h-full flex flex-col relative">
		<!-- 顶部工具栏 -->
		<div id="top" class="w-full h-14 shrink-0 z-10 flex items-center justify-between px-4">
			<div class="flex items-center gap-3">
				<el-tooltip content="返回航线列表" placement="bottom">
					<div @click="goBack" class="i-mdi:chevron-left cursor-pointer text-white text-2xl"></div>
				</el-tooltip>
				<el-divider direction="vertical" />
				<el-tooltip :content="curCreateWayline.id ? '保存航线（重新生成KMZ）' : '创建航线（生成KMZ）'" placement="bottom">
					<el-button type="success" plain :loading="saving" :icon="DocumentChecked" @click="handleSave">保存</el-button>
				</el-tooltip>
				<el-divider direction="vertical" />
				<el-dropdown trigger="click">
					<div class="bg-green c-white flex items-center hover:bg-green-500 p-2 rounded-md cursor-pointer">
						<SvgIcon name="/@/assets/wayline/航点航线.svg" :size="24" />
						航线设置
						<el-icon class="el-icon--right"><arrow-down /></el-icon>
					</div>
					<template #dropdown>
						<WaylineSetting></WaylineSetting>
					</template>
				</el-dropdown>
			</div>

			<div class="c-white flex items-center gap-3">
				<el-tag effect="dark" type="info">{{ curCreateWayline.templateStr || '未选择航线类型' }}</el-tag>
				<el-tag effect="dark" :type="curCreateWayline.domainTypeSubType ? 'success' : 'danger'">
					{{ curCreateWayline.droneModel || '未选择飞行器' }}
				</el-tag>
				<el-divider direction="vertical" />
				<el-button size="large" style="margin-left: 0px" text @click="waylineCreateDialog = true">
					{{ curCreateWayline.waylineName || '航点航线创建' }}
				</el-button>
			</div>

			<div>
				<el-tooltip content="航点数量" placement="bottom">
					<el-tag effect="plain" size="large" class="mr-2">航点 {{ pointCount }}</el-tag>
				</el-tooltip>
			</div>
		</div>

		<!-- 主体区域 -->
		<div class="flex-1 min-h-0 w-full flex">
			<div class="w-[16.5%] text-white overflow-auto">
				<WaylinePointSetting></WaylinePointSetting>
			</div>
			<div class="flex-1 min-w-0 relative">
				<WaylinePointSettingTop v-if="curPoint"></WaylinePointSettingTop>
				<CesiumMap v-if="!waylineCreateDialog" :options="{ inited: mapInited }"></CesiumMap>
			</div>
			<div class="w-[16.5%] text-white overflow-auto" style="background: color-mix(in srgb, var(--el-color-primary), black 30%)">
				<WaylinePointActionSetting v-if="curAction" :key="curAction.actionId" :cur-action="curAction"></WaylinePointActionSetting>
			</div>
		</div>

		<!-- 航线创建弹框 -->
		<el-dialog v-model="waylineCreateDialog" title="航线创建" :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false" style="width: 60%">
			<WaylineCreate @update:value="(val) => (waylineCreateDialog = val)"></WaylineCreate>
		</el-dialog>

		<!-- 航点动作编辑 -->
		<div class="absolute left-[17%] bottom-[5%] text-white">
			<WaylinePointActions></WaylinePointActions>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ArrowDown, DocumentChecked } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWaylineSave } from './hooks/useWaylineSave';
import { detailDjiWayline } from '/@/api/main/djiWayline';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { CesiumContextMenu } from '/@/utils/cesium/mouseEventHandler';
import { drawWayline } from '/@/utils/cesium/waylineUtil';
import { getHomeSvg } from '/@/utils/data/svgDataHelper';
import { NextLoading } from '/@/utils/loading';
import CesiumMap from '/@/views/component/cesiumMap.vue';

import WaylineCreate from './component/waylineCreateDialog.vue';
import WaylinePointActions from './component/waylinePointActions.vue';
import WaylinePointActionSetting from './component/waylinePointActionSetting.vue';
import WaylinePointSetting from './component/waylinePointSetting.vue';
import WaylinePointSettingTop from './component/waylinePointSettingTop.vue';
import WaylineSetting from './component/waylineSetting.vue';

const router = useRouter();
const route = useRoute();
const waylineStore = useWaylineStore();
const { saving, validate, saveWayline } = useWaylineSave();

const curCreateWayline = computed(() => waylineStore.curCreateWayline);
const curAction = computed(() => waylineStore.curAction);
const curPoint = computed(() => waylineStore.curPoint);
const pointCount = computed(() => curCreateWayline.value.folder?.placemarks?.length ?? 0);

// 航线名称或飞行器缺失时必须先完成创建配置
const waylineCreateDialog = ref(!(curCreateWayline.value.waylineName?.length > 0 && curCreateWayline.value.domainTypeSubType?.length > 0));

onMounted(async () => {
	NextLoading.done();
	await loadEditWayline();
});

/** 从列表页以「编辑」进入时，按路由查询参数拉取详情并回填编辑器 */
async function loadEditWayline() {
	const id = Number(route.query.id ?? 0);
	if (!id || waylineStore.curCreateWayline.id === id) return;
	try {
		const res = await detailDjiWayline(id);
		const detail = res.data.result;
		if (!detail) {
			ElMessage.warning('未找到该航线，已切换为新建模式');
			return;
		}
		waylineStore.loadWaylineDetail(detail);
		waylineCreateDialog.value = false;
		// 地图已就绪时立即重绘；否则由 mapInited 读取 store 后统一绘制
		if (window.viewer) {
			clearWaylineEntity();
			drawWayline({ isFlyto: true });
		}
	} catch {
		ElMessage.error('航线详情加载失败');
	}
}

/** 清除地图上已绘制的航点与起飞点（切换航线时航点数量可能减少，避免残留） */
function clearWaylineEntity() {
	const entities = window.viewer.entities;
	entities.values
		.filter((entity) => {
			const id = String(entity.id);
			return id.startsWith('waypoint_') || id === 'homePoint';
		})
		.forEach((entity) => entities.remove(entity));
}

/** 顶部保存按钮：校验不通过时给出提示，配置类缺失则直接唤起创建弹框 */
function handleSave() {
	const message = validate();
	if (message) {
		ElMessage.warning(message);
		if (!curCreateWayline.value.waylineName?.trim() || !curCreateWayline.value.domainTypeSubType) waylineCreateDialog.value = true;
		return;
	}
	saveWayline();
}

const mapInited = () => {
	new CesiumContextMenu(window.viewer);
	if (waylineStore.$state.setHome) setWaypointHome();
	drawWayline();
};

watch(
	() => waylineStore.$state.setHome,
	(val) => {
		if (val && window.viewer) setWaypointHome();
	}
);

function goBack() {
	router.push({ path: '/wayline/list' });
}

function setWaypointHome() {
	const svg = getHomeSvg('#21F705');
	// 编码为 URI
	const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
	// 应用到 Cesium 容器
	window.viewer.canvas.style.cursor = `url("${svgDataUrl}") 16 16, auto`;
}
</script>

<style>
#top {
	background: var(--el-color-primary);
	opacity: 0.8;
}
.hangdianSettings {
	width: 16%;
	top: 50px;
	height: 100%;
	background: var(--el-color-primary);
	opacity: 0.9;
}
#mapContextMenu {
	background: var(--el-color-primary);
	opacity: 0.8;
	min-width: 150px;
}
#mapContextMenu > div {
	padding: 6px 8px;
}
</style>
