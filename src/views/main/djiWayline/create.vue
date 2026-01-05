<template>
	<div class="h-full">
		<div id="top" class="w-full h-6% z-10 flex items-center justify-between pl-4">
			<div class="flex items-center">
				<div @click="router.go(-1)" class="i-mdi:chevron-left cursor-pointer text-white text-2xl"></div>
				<el-divider direction="vertical" />
				<div class="i-mdi-content-save cursor-pointer text-white text-2xl"></div>
				<el-divider direction="vertical" />
				<el-dropdown trigger="click" ref="waylineSettingRef" @visible-change="waylineSettingHandle">
					<div class="bg-green c-white flex items-center hover:bg-green-500 p-3 rounded-md cursor-pointer" @click="waylineSettingVisible = !waylineSettingVisible">
						<SvgIcon name="/@/assets/wayline/航点航线.svg" :size="24" />
						航线设置
						<el-icon class="el-icon--right"><arrow-down /></el-icon>
					</div>
					<template #dropdown>
						<WaylineSetting></WaylineSetting>
					</template>
				</el-dropdown>
			</div>
			<div class="c-white">
				<el-button size="large" type="success" text @click="waylineCreateVisible = true">航点航线创建</el-button>
				<el-divider direction="vertical" />
				<el-button size="large" style="margin-left: 0px" text @click="waylineCreateVisible = false">Matrice 4D</el-button>
			</div>
			<div>
				<el-button text size="large" :icon="Setting"></el-button>
			</div>
		</div>
		<div class="w-full h-94% flex">
			<div class="w-16.5% text-white">
				<WaylinePointSetting></WaylinePointSetting>
			</div>
			<div class="flex-1">
				<CesiumMap :options="{ inited: mapInited }"></CesiumMap>
			</div>
			<div class="w-16.5% text-white">
				<WaylinePointActionSetting></WaylinePointActionSetting>
			</div>
		</div>
		<!-- 航线创建弹框 -->
		<el-dialog v-model="waylineCreateVisible" title="航线创建" :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false" style="width: 60%">
			<WaylineCreate @update:value="(val) => (waylineCreateVisible = val)"></WaylineCreate>
		</el-dialog>
		<!-- 航点动作编辑    -->
		<div class="absolute left-16.5% bottom-5% text-white">
			<WaylinePointActions></WaylinePointActions>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import CesiumMap from '/@/views/component/cesiumMap.vue';
import { NextLoading } from '/@/utils/loading';

import WaylineCreate from './component/waylineCreateDialog.vue';

import { Setting, ArrowDown } from '@element-plus/icons-vue';
import WaylineSetting from './component/waylineSetting.vue';
import { DropdownInstance } from 'element-plus';
import WaylinePointSetting from './component/waylinePointSetting.vue';

import { CesiumContextMenu } from '/@/utils/cesium/mouseEventHandler';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { getHomeSvg } from '../../../utils/data/svgDataHelper';
import { useRouter } from 'vue-router';
import { drawWayline } from '/@/utils/cesium/waylineUtil';
import WaylinePointActions from './component/waylinePointActions.vue';
import WaylinePointActionSetting from './component/waylinePointActionSetting.vue';

const waylineSettingVisible = ref(false);
const waylineCreateVisible = ref(false);
const waylineSettingRef = ref<DropdownInstance>();
const waylineStore = useWaylineStore();
const router = useRouter();
onMounted(() => {
	NextLoading.done();
});
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
function waylineSettingHandle() {
	if (waylineSettingVisible.value) {
		waylineSettingRef.value!.handleOpen();
	} else {
		waylineSettingRef.value!.handleClose();
	}
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
