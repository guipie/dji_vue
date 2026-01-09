<template>
	<div id="waylinePointSetting" class="h-100%">
		<div class="flex justify-between" style="padding: 12px">
			<div>航点列表</div>
			<div>
				<el-icon><MoreFilled /></el-icon>
			</div>
		</div>
		<div class="flex justify-between text-white">
			<el-tooltip effect="dark" content="航线长度" placement="top-start">
				<div class="flex-col-center-1">
					<div class="i-line-md:check-list-3 w-36px"></div>
					<div>22.5m</div>
				</div>
			</el-tooltip>
			<el-tooltip effect="dark" content="预计执行时间" placement="top-start">
				<div class="flex-col-center-1">
					<div class="i-material-symbols:av-timer w-36px"></div>
					<div>22.5s</div>
				</div>
			</el-tooltip>
			<el-tooltip effect="dark" content="航点数量" placement="top-start">
				<div class="flex-col-center-1">
					<div class="i-material-symbols:edit-location-rounded"></div>
					<div>0</div>
				</div>
			</el-tooltip>
			<el-tooltip effect="dark" content="照片" placement="top-start">
				<div class="flex-col-center-1">
					<div class="i-material-symbols:imagesmode-outline"></div>
					<div>12</div>
				</div>
			</el-tooltip>
		</div>
		<div id="pointList" style="padding: 0px; padding-top: 10px" class="flex flex-col">
			<div
				v-for="(item, index) in placemarks"
				:key="index"
				style="border-bottom: solid 0.2px gray"
				:class="{ activeBg: selectedIndex == index }"
				class="flex items-center cursor-pointer hover:bg-auto sortable gap-1"
				@click="waylinePointClick(index)"
			>
				<div class="i-material-symbols:drag-pan text-xl cursor-move"></div>
				<div class="text-lg fw100 w-6">{{ index + 1 }}</div>
				<div class="flex-1 flex flex-wrap min-h-20px">
					<div v-for="(action, actionIndex) in item.actionsGroup" v-on:click.stop="waylineActionClick(index, actionIndex)">
						<div
							class="border rounded-lg p-1 hover:bg-blue-5"
							:class="{ 'bg-blue-6': selectedActionIndex == actionIndex && index == selectedIndex }"
							v-html="waylineActionData.findLast((m) => m.value == action.actionActuatorFunc)!.svg({ color: '#F5FCF4', size: 20 })"
						></div>
					</div>
				</div>
				<div>
					<el-dropdown @command="pointHandleCommand($event, index)" placement="bottom-end">
						<span class="el-dropdown-link c-white">
							<el-icon><MoreFilled /></el-icon>
						</span>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="del">删除此航点</el-dropdown-item>
								<el-dropdown-item command="clone">复制此航点 </el-dropdown-item>
								<el-dropdown-item command="setCoord">设置精确坐标</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { More, MoreFilled } from '@element-plus/icons-vue';
import Sortable from 'sortablejs';
import { computed, onMounted } from 'vue';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { waylinePointClick, waylineActionClick } from '/@/utils/cesium/waylineUtil';
import { waylineActionData, waylineSvgData } from '/@/utils/data/waylineSvgData';
import { PointPlacemark } from '/@/types/wayline/waylineCreate';

const waylineStore = useWaylineStore();
const placemarks = computed(() => waylineStore.$state.curCreateWayline.folder.placemarks ?? []);
const selectedIndex = computed(() => waylineStore.$state.selectedPointIndex);
const selectedActionIndex = computed(() => waylineStore.$state.selectedActionIndex);

onMounted(() => {
	Sortable.create(document.getElementById('pointList'), {
		// swap: true, // Enable swap plugin
		// swapClass: 'highlight', // The class applied to the hovered swap item
		ghostClass: 'move-bg-class',
		animation: 150,
		handle: '.sortable',
		onEnd: function (evt: any) {
			console.log(evt.newIndex, evt.oldIndex);
		},
	});
});
function pointHandleCommand(cmd: 'del' | 'clone' | 'setCoord', index: number) {
	if (cmd == 'del') {
		waylineStore.delWaylinePoint(index);
	} else if (cmd == 'clone') {
		// waylineStore.cloneWaylinePoint(selectedIndex.value)
	} else if (cmd == 'setCoord') {
		// waylineStore.setWaylinePointCoord(selectedIndex.value)
	}
}
</script>

<style scoped>
#pointList {
	overflow-y: auto;
	height: calc(100% - 100px);
	padding: 8px;
}
#pointList > div {
	padding: 4px;
	margin: 0px;
}
.move-bg-class {
	background: color-mix(in srgb, var(--el-color-primary), white 50%);
}
#waylinePointSetting > div {
	background: color-mix(in srgb, var(--el-color-primary), black 30%); /* 混合20%黑色使颜色更深 */
	/* 或者使用相对调整 */
	/* background: hsl(from var(--el-color-primary) h s calc(l - 10%)); */

	padding: 8px;
	border-bottom: 1px solid color-mix(in srgb, var(--el-color-primary), white 20%);
	color: white;
}
.activeBg {
	background: color-mix(in srgb, var(--el-color-primary), black 50%);
}
</style>
