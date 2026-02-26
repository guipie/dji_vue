<template>
	<div id="pointTop" v-if="(waylineStore.selectedPointIndex ?? -1) >= 0" class="p-4 flex gap-6">
		<el-tooltip class="box-item" effect="dark" placement="top">
			<div class="fllowItem" v-html="waylineSvgPointData.flowHeight({ size: 32, color: isFllowHeight ? '#0c74f4' : '#C9C2C2' })" @click="isFllowHeight = !isFllowHeight"></div>
			<template #content>
				<div v-if="isFllowHeight">跟随航线高度</div>
				<div v-else class="flex items-center gap-1">
					<div class="text-red-500">不跟随航线高度,</div>
					<div>
						自定义高度:
						<el-input-number v-model="curPlacemark.executeHeight" @change="setCurPointHeight" size="small" :min="20" :step="1">
							<template #suffix>
								<span>m</span>
							</template>
						</el-input-number>
					</div>
				</div>
			</template>
		</el-tooltip>
		<el-tooltip class="box-item" trigger="hover" effect="dark" placement="top">
			<!-- <div class="fllowItem relative" style="width: 38px; height: 38px">
				<el-button class="w-38px h-38px" v-if="curPlacemark.useGlobalTurnParam" type="primary">跟随<br />航线</el-button>
			</div> -->
			<div class="relative">
				<div class="relative w-12 h-12 rounded-full bg-blue-500" :class="curPlacemark.useGlobalTurnParam ? 'cursor-not-allowed' : 'cursor-pointer'" @click="turnModelClick">
					<img
						style="height: 100%"
						:src="
							globalWaypointTurnModeOptions.findLast(
								(item) => item.value === (curPlacemark.useGlobalTurnParam ? waylineStore.curCreateWayline.folder.globalWaypointTurnMode : curPlacemark.waypointTurnParam?.waypointTurnMode)
							)?.littleImg
						"
					/>
					<div
						class="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/3 w-6 h-6 rounded-full border-2 border-white i-material-symbols:settings-panorama-outline cursor-pointer"
						:class="curPlacemark.useGlobalTurnParam ? 'bg-blue-500 ' : 'bg-gray-5'"
						@click.stop="curPlacemark.useGlobalTurnParam = !curPlacemark.useGlobalTurnParam"
					></div>
				</div>
				<div id="turnParamDiv" class="absolute top-13" v-show="turnParamDivShow">
					<el-card class="cursor-pointer hover:bg-gray-100 hover:text-blue-500" v-for="item in globalWaypointTurnModeOptions" @click="turnModelSelectedClick(item)">
						<div class="flex items-center gap-1 min-w-200px">
							<img :src="item.littleImg" style="width: 48px" />
							<div>{{ item.label }}</div>
						</div>
						<br />
						<div v-if="item.value === 'coordinateTurn'" @click.stop="() => console.log(item.value)">
							入弯距离:<el-input-number v-model="curPlacemark.waypointTurnParam!.waypointTurnDampingDist" @change="setCurPointHeight" size="small" :min="0" :step="0.1">
								<template #suffix>
									<span>m</span>
								</template>
							</el-input-number>
						</div>
					</el-card>
				</div>
			</div>
			<template #content>
				<div>跟随航线的航点转弯模式</div>
			</template>
		</el-tooltip>

		<el-tooltip class="box-item" trigger="hover" effect="dark" placement="top">
			<!-- <div class="fllowItem relative" style="width: 38px; height: 38px">
				<el-button class="w-38px h-38px" v-if="curPlacemark.useGlobalTurnParam" type="primary">跟随<br />航线</el-button>
			</div> -->
			<div class="relative">
				<div class="relative w-12 h-12 rounded-full bg-blue-500" :class="curPlacemark.useGlobalHeadingParam ? 'cursor-not-allowed' : 'cursor-pointer'" @click="headingModelClick">
					<img
						style="height: 100%"
						:src="
							waypointHeadingModeOptions.findLast(
								(item) =>
									item.value ===
									(curPlacemark.useGlobalHeadingParam ? waylineStore.curCreateWayline.folder.globalWaypointHeadingParam.waypointHeadingMode : curPlacemark.waypointHeadingParam?.waypointHeadingMode)
							)?.img
						"
					/>
					<div
						class="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/3 w-6 h-6 rounded-full border-2 border-white i-material-symbols:settings-panorama-outline cursor-pointer"
						:class="curPlacemark.useGlobalHeadingParam ? 'bg-blue-500 ' : 'bg-gray-5'"
						@click.stop="curPlacemark.useGlobalHeadingParam = !curPlacemark.useGlobalHeadingParam"
					></div>
				</div>
				<div id="headingParamDiv" class="absolute top-13" v-show="headingParamDivShow">
					<el-card class="cursor-pointer hover:bg-gray-100 hover:text-blue-500" v-for="item in waypointHeadingModeOptions" @click="headingModelSelectedClick(item)">
						<div class="flex items-center gap-1 min-w-250px">
							<img :src="item.img" style="width: 48px" />
							<div>{{ item.label }}</div>
						</div>
						<div v-if="item.value === 'smoothTransition'" @click.stop="() => console.log(item.value)">
							<div class="m-1">飞行器旋转方向</div>
							<div>
								<el-radio-group v-model="curPlacemark.waypointHeadingParam!.waypointHeadingPathMode" size="small" fill="#409eff">
									<el-radio-button label="顺时针" value="clockwise" />
									<el-radio-button label="逆时针" value="counterClockwise" />
									<el-radio-button label="沿最短路径自动旋转" value="followBadArc" />
								</el-radio-group>
							</div>
							<div class="m-1 mt-2">飞到当前航点偏航角设置</div>
							<div>
								<el-input-number v-model="curPlacemark.waypointHeadingParam!.waypointHeadingAngle" size="small" :min="-180" :max="180" :step="1" style="width: 100%">
									<template #suffix>
										<span>°</span>
									</template>
								</el-input-number>
								<div class="mt-2 float-right">
									<Compass :angle="curPlacemark.waypointHeadingParam?.waypointHeadingAngle || 0"></Compass>
								</div>
							</div>
						</div>
					</el-card>
				</div>
			</div>
			<template #content>
				<div>跟随航线的偏航角模式</div>
			</template>
		</el-tooltip>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { waylineSvgPointData } from '/@/utils/data/waylineSvgSetting';
import { globalWaypointTurnModeOptions, waypointHeadingModeOptions } from '/@/types/wayline/waylineCreateOptions';
import { ElMessageBox } from 'element-plus';
import Compass from '/@/components/map/compass.vue';

const turnParamDivShow = ref(false);
const headingParamDivShow = ref(false);
const waylineStore = useWaylineStore();
const curPlacemark = ref(waylineStore.curCreateWayline.folder.placemarks![waylineStore.selectedPointIndex!]);
const isFllowHeight = ref(true);
function setCurPointHeight() {
	// var curPoint = waylineStore.curCreateWayline.folder.placemarks![waylineStore.selectedPointIndex!];
	// curPoint.executeHeight = curHeight.value;
	curPlacemark.value.point = curPlacemark.value.point.split(',')[0] + ',' + curPlacemark.value.point.split(',')[1] + ',' + curPlacemark.value.executeHeight;
}
function turnModelClick() {
	if (curPlacemark.value.useGlobalTurnParam) {
		turnParamDivShow.value = false;
		return ElMessageBox.alert('请先取消更随航线航点转弯模式');
	}
	turnParamDivShow.value = !turnParamDivShow.value;
}
function headingModelClick() {
	if (curPlacemark.value.useGlobalHeadingParam) {
		headingParamDivShow.value = false;
		return ElMessageBox.alert('请先取消更随航线偏航角模式');
	}
	headingParamDivShow.value = !headingParamDivShow.value;
}
function turnModelSelectedClick(item: any) {
	curPlacemark.value.waypointTurnParam!.waypointTurnMode = item.value;
	turnParamDivShow.value = false;
}

function headingModelSelectedClick(item: any) {
	curPlacemark.value.waypointHeadingParam!.waypointHeadingMode = item.value;
	headingParamDivShow.value = false;
}
</script>

<style scoped>
/* 设置 el-collapse 使用主题色 */
#pointTop {
	z-index: 100000;
	opacity: 0.8;
	border-radius: 0px 0px 8px 8px;
	position: absolute;
	top: 0;
	left: 0;
}
.fllowItem {
	cursor: pointer;
	width: 36px;
	height: 36px;
	background: rgba(49, 49, 49, 0.1) !important;
	border: 1px solid rgba(255, 255, 255, 0.1);
}
:deep(.el-collapse) {
	border-radius: 0px 0px 8px 8px;
	--el-collapse-border-color: var(--el-color-primary);
}
:deep(.el-collapse-item__header) {
	color: white;
	background-color: var(--el-color-primary);
	min-height: auto;
	margin: 1px;
}
:deep(.el-collapse-item__wrap) {
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.1) !important;
	padding: 2px;
}
/* 设置 el-switch 使用主题色 */
.el-switch--active .el-switch__core {
	background-color: var(--el-color-primary);
}
.el-switch__label {
	--el-switch-label-color: var(--el-color-primary);
}
.el-switch__label--active {
	--el-switch-label-active-color: var(--el-color-primary);
}
.el-switch__label--inactive {
	--el-switch-label-inactive-color: var(--el-color-primary);
}
.el-switch__label--active-icon {
	--el-switch-label-active-icon-color: var(--el-color-primary);
}
.el-switch__label--inactive-icon {
	--el-switch-label-inactive-icon-color: var(--el-color-primary);
}
.el-switch__label--active-text {
	--el-switch-label-active-text-color: var(--el-color-primary);
}
.el-switch__label--inactive-text {
	--el-switch-label-inactive-text-color: var(--el-color-primary);
}
.el-switch__label--active-bg {
	--el-switch-label-active-bg-color: var(--el-color-primary);
}
.el-switch__label--inactive-bg {
	--el-switch-label-inactive-bg-color: var(--el-color-primary);
}
.el-switch__label--active-border {
	--el-switch-label-active-border-color: var(--el-color-primary);
}
</style>
