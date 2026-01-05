<template>
	<div class="p-5 rounded-lg border border-gray-200 dark:border-gray-700 w-full bg-transparent">
		<h4 class="text-gray-500 dark:text-gray-400 mb-3">选择航线类型</h4>
		<div class="flex gap-3 content-start">
			<el-space wrap alignment="start">
				<el-card shadow="never">
					<template #header>
						<div class="card-header">
							<span>巡逻巡检航线</span>
						</div>
					</template>
					<div class="flex flex-wrap gap-3">
						<Card :selected="waylineCreateRequest.templateStr == '航点航线'" :image="HdWaylineIcon" cardStyle="width:86px;height:86px;" @click="selectWaylineType" description="航点航线" />
						<Card :selected="waylineCreateRequest.templateStr == '巡逻航线'" :image="XlWaylineIcon" cardStyle="width:86px;height:86px;" @click="selectWaylineType" description="巡逻航线" />
					</div>
				</el-card>
			</el-space>
			<el-space wrap alignment="start">
				<el-card shadow="never">
					<template #header>
						<div class="card-header">
							<span>测绘航线</span>
						</div>
					</template>
					<div class="flex flex-wrap gap-3">
						<Card :selected="waylineCreateRequest.templateStr == '面状航线'" :image="MzWaylineIcon" cardStyle="width:86px;height:86px;" @click="selectWaylineType" description="面状航线" />
						<Card :selected="waylineCreateRequest.templateStr == '带状航线'" :image="DzWaylineIcon" cardStyle="width:86px;height:86px;" @click="selectWaylineType" description="带状航线" />
					</div>
				</el-card>
			</el-space>
			<el-space wrap alignment="start">
				<el-card shadow="never">
					<template #header>
						<div class="card-header">
							<span>精细化测绘航线</span>
						</div>
					</template>
					<div class="flex flex-wrap gap-3">
						<Card :selected="waylineCreateRequest.templateStr == '斜面航线'" :image="XmWaylineIcon" cardStyle="width:86px;height:86px;" @click="selectWaylineType" description="斜面航线" />
						<Card :selected="waylineCreateRequest.templateStr == '几何体航线'" :image="JhtWaylineIcon" cardStyle="width:86px;height:86px;" @click="selectWaylineType" description="几何体航线" />
						<Card :selected="waylineCreateRequest.templateStr == '贴近摄影航线'" :image="TjsyWaylineIcon" cardStyle="width:92px;height:86px;" @click="selectWaylineType" description="贴近摄影航线" />
					</div>
				</el-card>
			</el-space>
		</div>
		<el-divider></el-divider>
		<!-- 选择飞行器 -->
		<div class="mb-6">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-3">选择飞行器</div>
			<div class="flex flex-wrap gap-4">
				<el-button
					v-for="drone in droneModels.keys()"
					:key="drone"
					:type="waylineCreateRequest.droneModel == drone ? 'primary' : ''"
					@click="waylineCreateRequest.droneModel = drone.toString()"
					size="large"
					style="margin-left: 0px"
				>
					{{ drone }}
				</el-button>
			</div>
		</div>

		<!-- 选择型号 -->
		<!-- <div class="mb-6">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-3">选择型号</div>
			<div class="col-start-1 row-start-1 flex flex-wrap gap-4">
				<el-button v-for="model in models" :key="model" :type="selectedModel === model ? 'primary' : ''" size="large" @click="selectModel(model)">
					{{ model }}
				</el-button>
			</div>
		</div> -->

		<!-- 配件 -->
		<div class="mb-6">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-3">配件</div>
			<div class="col-start-1 row-start-1 flex flex-wrap gap-4">
				<el-button v-for="acc in accessoriesList" :key="acc.value" :type="waylineCreateRequest.acc === acc.value ? 'primary' : ''" size="large" @click="waylineCreateRequest.acc = acc.value">
					{{ acc.label }}
				</el-button>
			</div>
		</div>

		<!-- 航线名称 -->
		<div class="mb-6">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-3">航线名称</div>
			<el-input v-model="waylineCreateRequest.waylineName" placeholder="请输入航线名称" />
		</div>
		<!-- 操作按钮 -->
		<div class="flex justify-end gap-4">
			<el-button @click="emits('update:value', false)">关闭</el-button>
			<el-button type="primary" @click="confirm">确定</el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import HdWaylineIcon from '/@/assets/wayline/航点航线.svg';
import XlWaylineIcon from '/@/assets/wayline/巡逻航线.svg';
import MzWaylineIcon from '/@/assets/wayline/面状航线.svg';
import DzWaylineIcon from '/@/assets/wayline/带状航线.svg';
import XmWaylineIcon from '/@/assets/wayline/斜面航线.svg';
import JhtWaylineIcon from '/@/assets/wayline/几何体航线.svg';
import TjsyWaylineIcon from '/@/assets/wayline/贴近摄影航线.svg';
import Card from '/@/views/component/uno/card.vue';
import { computed, onMounted, ref } from 'vue';
import { useWaylineStore } from '../../../../stores/useWaylineStore';
import { useDeviceStore } from '../../../../stores/useDeviceStore';
const waylineStore = useWaylineStore();
const deviceStore = useDeviceStore();
const waylineCreateRequest = ref(waylineStore.$state.curCreateWayline);

// 静态选项
const droneModels = computed(() => deviceStore.$state.droneModels);
const accessoriesList = [
	{ value: 'AS1', label: 'AS1 喊话器' },
	{ value: 'AL1', label: 'AL1 探照灯' },
];
const emits = defineEmits<{
	(e: 'update:value', value: boolean): void;
}>();
onMounted(() => {
	deviceStore.getDroneModels();
});
// 方法
function selectWaylineType(selectItem: any) {
	waylineCreateRequest.value.templateStr = selectItem.description;
}
const confirm = () => {
	console.log({});
};
</script>
