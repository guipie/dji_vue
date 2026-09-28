<template>
	<div class="p-5 rounded-lg border border-gray-200 dark:border-gray-700 w-full bg-transparent">
		<h4 class="text-gray-500 dark:text-gray-400 mb-3">选择航线类型</h4>
		<div class="flex gap-3 content-start flex-wrap">
			<el-card v-for="group in waylineTypeGroups" :key="group.title" shadow="never">
				<template #header>
					<div class="card-header">
						<span>{{ group.title }}</span>
					</div>
				</template>
				<div class="flex flex-wrap gap-3">
					<Card
						v-for="item in group.items"
						:key="item.templateStr"
						:selected="waylineCreateRequest.templateStr == item.templateStr"
						:image="item.icon"
						:cardStyle="item.supported ? item.cardStyle : `${item.cardStyle}opacity:0.45;filter:grayscale(1);`"
						:description="item.templateStr"
						@click="selectWaylineType(item)"
					/>
				</div>
			</el-card>
		</div>

		<el-divider></el-divider>

		<!-- 选择飞行器 -->
		<div class="mb-6">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-3">选择飞行器</div>
			<div class="flex flex-wrap gap-4">
				<el-button
					v-for="drone in droneList"
					:key="drone.name"
					:type="waylineCreateRequest.droneModel == drone.name ? 'primary' : ''"
					size="large"
					style="margin-left: 0px"
					@click="
						waylineCreateRequest.droneModel = drone.name;
						waylineCreateRequest.domainTypeSubType = drone.type;
					"
				>
					{{ drone.name }}
				</el-button>
				<el-text v-if="!droneList.length" type="info">暂无可选飞行器，请先在「设备型号」中维护基础数据</el-text>
			</div>
		</div>

		<!-- 配件 -->
		<div class="mb-6">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-3">配件</div>
			<div class="flex flex-wrap gap-4">
				<el-button
					v-for="acc in accessoriesList"
					:key="acc.value"
					:type="waylineCreateRequest.acc === acc.value ? 'primary' : ''"
					size="large"
					style="margin-left: 0px"
					@click="waylineCreateRequest.acc = waylineCreateRequest.acc === acc.value ? '' : acc.value"
				>
					{{ acc.label }}
				</el-button>
			</div>
		</div>

		<!-- 所属空间 -->
		<div class="mb-6">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-3">所属空间（留空则使用当前用户的默认空间）</div>
			<workspaceSelect v-model:id="waylineCreateRequest.workspaceId" :options="{ placeholder: '请选择所属空间' }"></workspaceSelect>
		</div>

		<!-- 航线名称 -->
		<div class="mb-6">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-3">航线名称</div>
			<el-input v-model="waylineCreateRequest.waylineName" maxlength="64" show-word-limit placeholder="请输入航线名称" />
		</div>

		<!-- 操作按钮 -->
		<div class="flex justify-between items-center gap-4">
			<div class="text-xs text-gray-400">确定后请在卫星地图上绘制航点，再点击顶部保存按钮生成大疆机场可识别的 KMZ 文件</div>
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
import workspaceSelect from '/@/views/component/workspaceSelect.vue';
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { useDeviceStore } from '/@/stores/useDeviceStore';
import { TemplateTypeEnum } from '/@/types/wayline/waylineEnus';
import type { WaylineTypeItem } from '/@/types/wayline/waylineCreate';

const emits = defineEmits<{
	(e: 'update:value', value: boolean): void;
}>();

const waylineStore = useWaylineStore();
const deviceStore = useDeviceStore();
// 用 storeToRefs 取值：详情回填会整体替换 curCreateWayline，普通引用会失效
const { curCreateWayline: waylineCreateRequest } = storeToRefs(waylineStore);

/**
 * 可选飞行器列表
 * @description droneModels 是 Map，Vue 的 v-for 对 Map 只做 Object.keys 遍历而取不到条目，
 * 因此显式转成数组再渲染。
 */
const droneList = computed(() => Array.from(deviceStore.$state.droneModels, ([name, type]) => ({ name, type })));

const accessoriesList = [
	{ value: 'AS1', label: 'AS1 喊话器' },
	{ value: 'AL1', label: 'AL1 探照灯' },
];

/**
 * 航线类型分组
 * @description 大疆 WPML 只定义了 4 种 templateType；目前仅「航点航线」完成了参数编辑与 KMZ 生成，
 * 其余业务别名暂标记为开发中，避免用航点参数生成结构不正确的测绘模板 KMZ。
 */
const waylineTypeGroups: { title: string; items: WaylineTypeItem[] }[] = [
	{
		title: '巡逻巡检航线',
		items: [
			{ templateStr: '航点航线', templateType: TemplateTypeEnum.waypoint, icon: HdWaylineIcon, cardStyle: 'width:86px;height:86px;', supported: true },
			{ templateStr: '巡逻航线', templateType: TemplateTypeEnum.waypoint, icon: XlWaylineIcon, cardStyle: 'width:86px;height:86px;', supported: false },
		],
	},
	{
		title: '测绘航线',
		items: [
			{ templateStr: '面状航线', templateType: TemplateTypeEnum.mapping2d, icon: MzWaylineIcon, cardStyle: 'width:86px;height:86px;', supported: false },
			{ templateStr: '带状航线', templateType: TemplateTypeEnum.mappingStrip, icon: DzWaylineIcon, cardStyle: 'width:86px;height:86px;', supported: false },
		],
	},
	{
		title: '精细化测绘航线',
		items: [
			{ templateStr: '斜面航线', templateType: TemplateTypeEnum.mapping3d, icon: XmWaylineIcon, cardStyle: 'width:86px;height:86px;', supported: false },
			{ templateStr: '几何体航线', templateType: TemplateTypeEnum.mapping3d, icon: JhtWaylineIcon, cardStyle: 'width:86px;height:86px;', supported: false },
			{ templateStr: '贴近摄影航线', templateType: TemplateTypeEnum.mapping3d, icon: TjsyWaylineIcon, cardStyle: 'width:92px;height:86px;', supported: false },
		],
	},
];

onMounted(() => {
	deviceStore.getDroneModels();
});

// 方法
function selectWaylineType(selectItem: WaylineTypeItem) {
	if (!selectItem.supported) {
		ElMessage.warning(`「${selectItem.templateStr}」的参数编辑面板尚在开发中，当前仅支持航点航线`);
		return;
	}
	// templateStr 与 templateType 必须同步，否则落库的中文名与实际生成的 WPML 模板类型会不一致
	waylineCreateRequest.value.templateStr = selectItem.templateStr;
	waylineCreateRequest.value.templateType = selectItem.templateType;
}

const confirm = () => {
	if (!waylineCreateRequest.value.waylineName?.trim()) {
		ElMessage.warning('请输入航线名称');
		return;
	}
	if (!waylineCreateRequest.value.domainTypeSubType) {
		ElMessage.warning('请选择飞行器');
		return;
	}
	emits('update:value', false);
};
</script>
