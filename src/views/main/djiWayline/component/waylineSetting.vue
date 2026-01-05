<template>
	<div id="waylineSetting" class="flex flex-col w-360px">
		<div class="p-4 flex flex-col gap-2">
			<div class="flex items-center gap-1">
				<div>起飞点</div>
				<el-tooltip class="box-item" effect="dark" content="“起飞点”仅做航线规划参考，飞机执行航线时以飞机真实的起飞点为准。" placement="right">
					<el-icon color="#F3F4FF" class="text-white text-lg">
						<QuestionFilled />
					</el-icon>
				</el-tooltip>
			</div>

			<div class="flex justify-between items-center">
				<span class="text-white">已设置参考起飞点</span>
				<el-button size="large" type="success" @click="waylineStore.setHomeAction(true)">
					<span v-if="homeSvg" v-html="homeSvg"></span>
					重新设置起飞点</el-button
				>
			</div>
		</div>

		<div class="p-4 flex flex-col gap-2">
			<div>拍照设置</div>
			<el-checkbox-group v-model="waylineCreateRequest.folder.payloadParam.imageFormat" size="small">
				<el-checkbox-button label="广角照片" value="wide"></el-checkbox-button>
				<el-checkbox-button label="红外照片" value="ir"></el-checkbox-button>
				<el-checkbox-button label="变焦照片" value="zoom"></el-checkbox-button>
			</el-checkbox-group>
			<div class="flex justify-between">
				<div class="flex items-center gap-1">
					<div>智能低光</div>
					<el-tooltip effect="dark" content="仅支持定向拍照动作开启智能低光模式。智能低光开启后，提升低光环境下的拍摄效果，适应更多光照条件的作业场景，但拍摄速度会有所降低。" placement="right">
						<el-icon color="#F3F4FF" class="text-white text-lg">
							<QuestionFilled />
						</el-icon>
					</el-tooltip>
				</div>
				<el-switch v-model="ext.orientedPhotoMode" inline-prompt active-value="lowLightSmartShooting" inactive-value="normalPhoto" active-text="智能低光" inactive-text="普通拍照" />
			</div>
		</div>
		<el-tooltip class="box-item" effect="dark" placement="right">
			<template #content>
				<div class="flex flex-col gap-3">
					<div>垂直爬升：飞行器爬升到航线起始点高度后，再飞向航线起始点。</div>
					<div>倾斜爬升：飞行器爬升到"安全起飞高度"后，再直线飞到航线起始点。</div>
					<div>安全起飞高度：是相对起飞点的高度值。</div>
					<div>
						<div>飞行器起飞后，会先上升至"安全起飞高度"，再飞向航线起始点。</div>
						<div style="text-align: center; margin-top: 10px">
							<img src="/@/assets/wayline/爬升tips.svg" alt="爬升tips" />
						</div>
					</div>
				</div>
			</template>
			<div class="p-4 flex flex-col gap-2">
				<el-radio-group v-model="waylineCreateRequest.missionConfig.flyToWaylineMode" size="small">
					<el-radio-button value="safely"> 垂直爬升 </el-radio-button>
					<el-radio-button value="pointToPoint"> 倾斜爬升 </el-radio-button>
				</el-radio-group>
				<div class="flex justify-between gap-1">
					<div>
						<img style="width: 100%; height: 100%" src="/@/assets/wayline/爬升setting.svg" />
					</div>
					<div class="flex flex-col justify-center w-50px">
						<el-button type="primary" size="small" @click="takeOffSecurityHeightSet(100)">+100</el-button>
						<el-button style="margin-left: 0px" type="primary" size="small" @click="takeOffSecurityHeightSet(10)">+10</el-button>
						<el-input v-model="waylineCreateRequest.missionConfig.takeOffSecurityHeight">
							<template #suffix>m</template>
						</el-input>
						<el-button type="primary" size="small" @click="takeOffSecurityHeightSet(-10)">-10</el-button>
						<el-button style="margin-left: 0px" type="primary" size="small" @click="takeOffSecurityHeightSet(-100)">-100</el-button>
					</div>
				</div>
			</div>
		</el-tooltip>
		<el-tooltip class="box-item" effect="dark" placement="right">
			<template #content>
				<div class="flex flex-col gap-3">
					<div class="text-small text-amber">海拔高度：航点高度值相对于海平面高度保持不变。</div>
					<div class="text-small text-amber">相对起飞点高度（ALT）：航点高度值相对起飞点的高度保持不变。</div>
					<div class="text-small text-amber">相对地形的高度（AGL）：航点高度值相对地形/模型高度保持不变。</div>
				</div>
			</template>
			<div class="flex flex-col">
				<div class="px-4 py-2">航点高度模式</div>
				<div class="px-4 flex flex-col gap-2">
					<el-radio-group v-model="ext.waylinePointHeightMode" size="small">
						<el-radio-button value="hb"> 海拔高度 </el-radio-button>
						<el-radio-button value="xdqfd"> 相对起飞点高度 </el-radio-button>
						<el-radio-button value="xddm"> 相对地面高度 </el-radio-button>
					</el-radio-group>
					<div class="flex items-center justify-between gap-1">
						<div>
							<img style="width: 100%; height: 90%" :src="imageMap[ext.waylinePointHeightMode]" />
						</div>
						<div class="flex flex-col justify-center w-50px">
							<el-button type="primary" size="small" @click="takeOffRefPointAGLHeightSet(100)">+100</el-button>
							<el-button style="margin-left: 0px" type="primary" size="small" @click="takeOffRefPointAGLHeightSet(10)">+10</el-button>
							<el-input v-model="waylineCreateRequest.missionConfig.takeOffRefPointAGLHeight">
								<template #suffix>m</template>
							</el-input>
							<el-button type="primary" size="small" @click="takeOffRefPointAGLHeightSet(-10)">-10</el-button>
							<el-button style="margin-left: 0px" type="primary" size="small" @click="takeOffRefPointAGLHeightSet(-100)">-100</el-button>
						</div>
					</div>
				</div>
			</div>
		</el-tooltip>
		<div class="p-4 flex flex-col gap-2">
			<div>全局航线速度</div>
			<div class="flex">
				<div @click="waylineCreateRequest.folder.autoFlightSpeed -= 1" class="option-selected-hover text-lg">-</div>
				<el-input controls-position="right" v-model="waylineCreateRequest.folder.autoFlightSpeed">
					<template #suffix>m/s</template>
				</el-input>
				<div @click="waylineCreateRequest.folder.autoFlightSpeed += 1" class="option-selected-hover text-lg">+</div>
			</div>
		</div>
		<el-collapse v-model="advancedActive">
			<el-collapse-item title="Consistency" name="1">
				<template #title>
					<div class="card-header text-center text-lg">高级设置</div>
				</template>
				<div>
					<div class="p-4 flex flex-col gap-2">
						<div>起飞速度</div>
						<div class="flex">
							<div @click="waylineCreateRequest.missionConfig.globalTransitionalSpeed -= 1" class="option-selected-hover text-lg">-</div>
							<el-input controls-position="right" v-model="waylineCreateRequest.missionConfig.globalTransitionalSpeed">
								<template #suffix>m/s</template>
							</el-input>
							<div @click="waylineCreateRequest.missionConfig.globalTransitionalSpeed += 1" class="option-selected-hover text-lg">+</div>
						</div>
					</div>
					<div class="p-4 flex flex-col gap-2">
						<div>航点类型</div>
						<el-select popper-class="hdmode-popper" class="hdmode-select" v-model="waylineCreateRequest.folder.globalWaypointTurnMode" style="width: 240px">
							<el-option :label="item.label" :value="item.value" v-for="item in globalWaypointTurnModeOptions">
								<div class="h-74px"><img style="height: 100%" :src="item.img" alt="img" /></div>
								<div class="text-xs">{{ item.label }}</div>
							</el-option>
						</el-select>
					</div>
					<div class="p-4 flex flex-col gap-2">
						<div class="flex items-center gap-1">
							<div>飞行器偏航角模式</div>
							<el-tooltip class="box-item" effect="dark" placement="right">
								<template #content>
									<div class="text-xs flex flex-col gap-2">
										<div>沿航线方向：飞行器机头沿着航线方向飞至下一航点</div>
										<div>手动控制：飞行器在飞至下一航点的过程中，用户可以手动控制飞行器机头朝向</div>
										<div>锁定当前偏航角：飞行器机头保持执行完航点动作后的飞行器偏航角飞至下一航点"</div>
									</div>
								</template>
								<el-icon color="#F3F4FF" class="text-white text-lg">
									<QuestionFilled />
								</el-icon>
							</el-tooltip>
						</div>
						<el-select v-model="waylineCreateRequest.folder.globalWaypointHeadingParam.waypointHeadingMode" style="width: 240px">
							<el-option label="沿航线方向" value="followWayline" />
							<el-option label="手动控制" value="manually" />
							<el-option label="锁定当前偏航角" value="fixed" />
						</el-select>
					</div>
					<div class="p-4 flex flex-col gap-2">
						<div class="flex items-center gap-1">
							<div>航点间云台俯仰角控制模式</div>
							<el-tooltip class="box-item" effect="dark" placement="right">
								<template #content>
									<div class="text-xs flex flex-col gap-2">
										<div>手动控制：飞行器从一个航点飞向下一个航点的过程中，支持用户手动控制云台的俯仰角度；若无用户控制，则保持飞离航点时的云台俯仰角度。</div>
										<div>依照每个航点设置：飞行器从一个航点飞向下一个航点的过程中，云台俯仰角均匀过渡至下一个航点的俯仰角。</div>
									</div>
								</template>
								<el-icon color="#F3F4FF" class="text-white text-lg">
									<QuestionFilled />
								</el-icon>
							</el-tooltip>
						</div>
						<el-select v-model="waylineCreateRequest.folder.gimbalPitchMode" style="width: 240px">
							<el-option label="手动控制" value="manual" />
							<el-option label="依照每个航点设置" value="usePointSetting" />
						</el-select>
					</div>
					<div class="p-4 flex flex-col gap-2">
						<div class="flex items-center gap-1">
							<div>航线结束动作</div>
							<el-tooltip class="box-item" effect="dark" placement="right">
								<template #content>
									<div class="text-xs flex flex-col gap-2">
										<div>自动返航：飞行器航线任务完成后，立即飞向起飞点。若飞行器此时处于失联状态或飞向起飞点的过程中飞行器失联，则立即执行失联行为</div>
										<div>返回航线起始点悬停：飞行器航线任务完成后，立即飞向起始点（S点），若飞行器此时处于失联状态或飞向起始点（S点）的过程中飞行器失联，则立即执行失联行为</div>
										<div>退出航线模式：飞行器航线任务完成后，立即退出航线模式，并悬停在原点。若飞行器此时处于失联状态，则立即执行失联行为</div>
										<div>原地降落：飞行器航线任务完成后，立即开始降落。若飞行器此时处于失联状态或在降落过程中失联，则立即执行失联行为</div>
									</div>
								</template>
								<el-icon color="#F3F4FF" class="text-white text-lg">
									<QuestionFilled />
								</el-icon>
							</el-tooltip>
						</div>
						<el-select v-model="waylineCreateRequest.missionConfig.finishAction" style="width: 240px">
							<el-option label="自动返航" value="goHome" />
							<el-option label="返回航线起始点悬停" value="gotoFirstWaypoint" />
							<el-option label="退出航线模式" value="noAction" />
							<el-option label="原地降落" value="autoLand" />
						</el-select>
					</div>
					<div class="p-4 flex justify-between items-center">
						<div class="flex items-center gap-1">
							<div>航线绕行</div>
							<el-tooltip class="box-item" effect="dark" placement="right">
								<template #content>
									<div class="text-xs">航线绕行开启后，飞行器在执行航线过程中遇到障碍物将尝试绕行，若绕行失败将中断航线。</div>
								</template>
								<el-icon color="#F3F4FF" class="text-white text-lg">
									<QuestionFilled />
								</el-icon>
							</el-tooltip>
						</div>
						<el-switch v-model="waylineCreateRequest.missionConfig.autoRerouteInfoVal" />
					</div>
				</div>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup lang="ts">
import { QuestionFilled, ArrowDownBold, ArrowUpBold } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import hbImage from '/@/assets/wayline/航点高度模式hb.svg';
import xdqfdImage from '/@/assets/wayline/航点高度模式xdqfd.svg';
import xddmImage from '/@/assets/wayline/航点高度模式xddm.svg';
import { globalWaypointTurnModeOptions } from '/@/types/wayline/waylineCreateOptions';
import { getHomeSvg } from '../../../../utils/data/svgDataHelper';
import { drawWayline } from '/@/utils/cesium/waylineUtil';

const imageMap = {
	hb: hbImage,
	xdqfd: xdqfdImage,
	xddm: xddmImage,
};
const homeSvg = getHomeSvg('#F7FCFC');

const advancedActive = ref(['0']);
const waylineStore = useWaylineStore();
const waylineCreateRequest = ref(waylineStore.$state.curCreateWayline);
const ext = ref(waylineStore.$state.curCreateWaylineExt);
function takeOffSecurityHeightSet(val: number) {
	waylineCreateRequest.value.missionConfig.takeOffSecurityHeight += val;
	drawWayline();
}
function takeOffRefPointAGLHeightSet(val: number) {
	waylineCreateRequest.value.missionConfig.takeOffRefPointAGLHeight += val;
	drawWayline();
}
</script>
<style>
.hdmode-popper .el-select-dropdown__item {
	height: 98px;
}
</style>
<style scoped>
/* 主容器样式 */
#waylineSetting {
	height: 90vh;
	overflow-y: auto;
	background: linear-gradient(135deg, color-mix(in srgb, var(--el-color-primary), white 5%), color-mix(in srgb, var(--el-color-primary), black 10%));
	padding: 8px;
	box-sizing: border-box;
}

/* 美化滚动条 */
#waylineSetting::-webkit-scrollbar {
	width: 6px;
}

#waylineSetting::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 3px;
}

#waylineSetting::-webkit-scrollbar-thumb {
	background: var(--el-color-primary-light-3);
	border-radius: 3px;
}

#waylineSetting::-webkit-scrollbar-thumb:hover {
	background: var(--el-color-primary-light-1);
}

/* 卡片样式 */
#waylineSetting > div:not(.el-collapse) {
	background-color: color-mix(in srgb, var(--el-color-primary), white 10%);
	backdrop-filter: blur(10px);
	margin: 4px 2px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	color: white;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

#waylineSetting > div:not(.el-collapse):hover {
	background: rgba(255, 255, 255, 0.12);
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	transform: translateY(-2px);
}
/* Element Plus 输入框美化 */
:deep(.el-input__wrapper) {
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 4px;
	box-shadow: none;
}

:deep(.el-input__wrapper.is-focus) {
	border-color: var(--el-color-primary);
	box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-input__inner) {
	background: transparent;
	color: white;
}

:deep(.el-input__inner::placeholder) {
	color: rgba(255, 255, 255, 0.5);
}
/* Element Plus 下拉框美化 */
:deep(.el-select) {
	background: rgba(0, 0, 0, 0.2) !important;
}

:deep(.el-select .el-select__wrapper) {
	background: rgba(0, 0, 0, 0.2) !important;
	border: 1px solid rgba(255, 255, 255, 0.15) !important;
	border-radius: 4px !important;
	box-shadow: none !important;
	color: white;
}
:deep(.el-select .el-select__selected-item) {
	color: white;
}

/* Element Plus 开关美化 */
:deep(.el-switch__core) {
	background: rgba(255, 255, 255, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.15);
}

:deep(.el-switch.is-checked .el-switch__core) {
	background: var(--el-color-primary);
	border-color: var(--el-color-primary);
}

/* Element Plus 选择器美化 */
:deep(.el-radio-button__inner) {
	background: #dededed6;
	backdrop-filter: blur(10px);
	color: rgb(109 98 98 / 71%);
}

/* 文字样式 */
.text-small {
	font-size: 12px;
	line-height: 1.4;
}

.text-gray {
	color: #a0aec0;
}

/* 图片容器 */
#waylineSetting img {
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(0, 0, 0, 0.2);
	padding: 4px;
}

/* 折叠面板特殊处理 */
#waylineSetting > .el-collapse {
	margin: 8px 4px;
	border-radius: 8px;
	border: none;
}

/* Element Plus 折叠面板美化 */
:deep(.el-collapse-item__header) {
	background: rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	color: white;
	font-weight: 600;
	padding: 12px 20px;
	transition: all 0.3s ease;
	i {
		color: white;
	}
}

:deep(.el-collapse-item__header:hover) {
	background: rgba(255, 255, 255, 0.12);
}

:deep(.el-collapse-item__arrow) {
	color: var(--el-color-primary);
}

:deep(.el-collapse-item__wrap) {
	background: rgba(255, 255, 255, 0.05);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-top: none;
	color: white;
}

:deep(.el-collapse-item__content) {
	padding: 16px 20px;
	color: white;
}
</style>
