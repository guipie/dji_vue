<template>
	<div class="flyzone-page">
		<el-tabs v-model="activeTab" class="flyzone-tabs">
			<el-tab-pane :label="t('zone.tab.map')" name="map">
				<div class="map-layout">
					<!-- 左侧：区域列表 -->
					<div class="zone-panel">
						<div class="panel-head">
							<workspaceSelect v-model:id="queryWorkspaceId" @update:id="handleWorkspaceChange" />
						</div>

						<div class="toolbar">
							<el-button-group>
								<el-button size="small" :type="drawing === 'polygon' ? 'primary' : 'default'" icon="ele-EditPen" @click="beginDraw('polygon')">
									{{ t('zone.draw.polygon') }}
								</el-button>
								<el-button size="small" :type="drawing === 'circle' ? 'primary' : 'default'" icon="ele-Circle" @click="beginDraw('circle')">
									{{ t('zone.draw.circle') }}
								</el-button>
							</el-button-group>
							<div class="mt-2 flex gap-1">
								<el-button size="small" :disabled="!drawing" type="success" icon="ele-Check" @click="finishDraw">
									{{ t('zone.draw.finish') }}
								</el-button>
								<el-button size="small" :disabled="!drawing" icon="ele-RefreshLeft" @click="undoPointDraw">{{ t('zone.draw.undo') }}</el-button>
								<el-button size="small" :disabled="!drawing" icon="ele-Close" @click="cancelDraw">{{ t('zone.draw.cancel') }}</el-button>
							</div>
						</div>

						<div v-if="drawing" class="draw-tip">
							{{ drawing === 'circle' ? t('zone.draw.tipCircle') : t('zone.draw.tipPolygon') }}
							<span class="c-brand"> {{ draftPoints.length }} </span>
							{{ t('zone.draw.pointCount') }}
						</div>

						<el-scrollbar class="zone-list">
						<div
							v-for="row in zones"
							:key="row.id"
							class="zone-item"
							:class="{ active: selectedId === row.id, muted: !row.isEnabled }"
							:title="t('zone.form.edit')"
							@click="selectRow(row)"
							@dblclick="editRow(row)"
						>
							<span class="zone-dot" :style="{ background: row.color || colorFor(row.zoneType) }" />
							<div class="min-w-0 flex-1">
								<div class="truncate text-xs font-medium">{{ row.name }}</div>
								<div class="truncate text-[10px] c-gray">{{ row.zoneTypeName }} · {{ row.shapeName }} · {{ formatArea(row) }}</div>
							</div>
							<el-button
								class="zone-del"
								size="small"
								text
								type="danger"
								icon="ele-Delete"
								:title="t('zone.form.delete')"
								@click.stop="removeZoneRow(row)"
							/>
							<el-switch v-model="row.isEnabled" size="small" @click.stop @change="(v: any) => toggleEnable(row, v)" />
						</div>
							<el-empty v-if="!zones.length" :description="t('zone.empty')" :image-size="60" />
						</el-scrollbar>

						<div class="panel-foot">
							<el-button size="small" type="primary" icon="ele-Download" @click="openExport">{{ t('zone.export.title') }}</el-button>
						</div>
					</div>

					<!-- 右侧：地图 -->
					<div class="map-wrap">
						<div id="cesiumContainer"></div>
						<div v-if="mapLoading" class="map-mask">{{ t('zone.mapLoading') }}</div>
					</div>
				</div>
			</el-tab-pane>

			<el-tab-pane :label="t('zone.tab.file')" name="file">
				<!-- ───────── 原有「文件登记台账」：云端把文件下发到设备的记录 ───────── -->
				<el-card shadow="hover" :body-style="{ paddingBottom: '0' }">
					<el-form :model="fileQuery" label-width="90">
						<el-row>
							<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="5" class="mb10">
								<el-form-item :label="t('zone.file.workspace')">
									<workspaceSelect v-model:id="fileQuery.workspaceId" @update:id="handleFileWorkspaceChange" />
								</el-form-item>
							</el-col>
							<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="5" class="mb10">
								<el-form-item :label="t('zone.file.dock')">
									<el-select v-model="fileQuery.dockSn" clearable filterable :placeholder="t('zone.file.all')" @change="loadFiles">
										<el-option v-for="dock in fileDocks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
								<el-form-item>
									<el-button-group>
										<el-button type="primary" icon="ele-Search" @click="loadFiles">{{ t('zone.file.query') }}</el-button>
										<el-button icon="ele-Refresh" @click="resetFileQuery">{{ t('zone.file.reset') }}</el-button>
									</el-button-group>
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
				</el-card>

				<el-card class="mt-2" shadow="hover">
					<div class="mb10 flex flex-wrap items-center">
						<el-button type="primary" icon="ele-Plus" @click="openRegister">{{ t('zone.file.register') }}</el-button>
						<el-button icon="ele-Refresh" :disabled="fileSelection.length !== 1" @click="handleNotify">{{ t('zone.file.notify') }}</el-button>
						<el-button type="danger" icon="ele-Delete" :disabled="!fileSelection.length" @click="handleFileDelete">
							{{ t('zone.file.delete') }}（{{ fileSelection.length }}）
						</el-button>
					</div>

					<el-alert type="info" :closable="false" show-icon class="mb10">
						<template #title>
							<span class="text-xs">{{ t('zone.file.tip') }}</span>
						</template>
					</el-alert>

					<el-table :data="fileRows" style="width: 100%" v-loading="fileLoading" size="small" border row-key="id" @selection-change="(v: any) => (fileSelection = v)">
						<el-table-column type="selection" width="45" align="center" />
						<el-table-column prop="fileName" :label="t('zone.file.name')" min-width="200" show-overflow-tooltip />
						<el-table-column :label="t('zone.file.dock')" width="150" show-overflow-tooltip>
							<template #default="scope">{{ scope.row.dockNick || scope.row.dockSn || '-' }}</template>
						</el-table-column>
						<el-table-column :label="t('zone.file.active')" width="90" align="center">
							<template #default="scope">
								<el-tag v-if="scope.row.isActive" type="success" size="small" effect="dark">{{ t('zone.file.enabled') }}</el-tag>
								<el-tag v-else type="info" size="small" effect="plain">{{ t('zone.file.history') }}</el-tag>
							</template>
						</el-table-column>
						<el-table-column :label="t('zone.file.syncStatus')" width="110" align="center">
							<template #default="scope">
								<el-tag size="small" effect="plain" :type="syncTagType(scope.row.syncStatus)">{{ scope.row.syncStatusName }}</el-tag>
							</template>
						</el-table-column>
						<el-table-column prop="syncReasonName" :label="t('zone.file.failReason')" min-width="180" show-overflow-tooltip />
						<el-table-column prop="fileSizeText" :label="t('zone.file.size')" width="100" align="right" />
						<el-table-column :label="t('zone.file.checksum')" width="140">
							<template #default="scope">
								<el-tooltip :content="scope.row.checksum || ''" placement="top">
									<span class="font-mono text-xs">{{ shortDigest(scope.row.checksum) }}</span>
								</el-tooltip>
							</template>
						</el-table-column>
						<el-table-column prop="lastTime" :label="t('zone.file.lastSync')" width="160">
							<template #default="scope">{{ formatDateTime(scope.row.lastTime) }}</template>
						</el-table-column>
					</el-table>

					<el-pagination
						class="mt15"
						v-model:currentPage="fileParams.page"
						v-model:page-size="fileParams.pageSize"
						:total="fileParams.total"
						:page-sizes="[20, 50, 100]"
						small
						background
						layout="total, sizes, prev, pager, next, jumper"
						@size-change="loadFiles"
						@current-change="loadFiles"
					/>
				</el-card>
			</el-tab-pane>
		</el-tabs>

		<!-- 属性抽屉 -->
		<el-drawer v-model="formVisible" :title="editing ? t('zone.form.edit') : t('zone.form.create')" size="380px" @closed="resetForm">
			<el-alert type="info" :closable="false" show-icon class="mb10">
				<template #title><span class="text-xs">{{ t('zone.form.tip') }}</span></template>
			</el-alert>
			<el-form :model="form" label-width="88">
				<el-form-item :label="t('zone.form.name')" required>
					<el-input v-model="form.name" maxlength="128" />
				</el-form-item>
				<el-form-item :label="t('zone.form.type')">
					<el-radio-group v-model="form.zoneType">
						<el-radio :value="0">{{ t('zone.typeCustom') }}</el-radio>
						<el-radio :value="1">{{ t('zone.typeNoFly') }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="t('zone.form.shape')">
					<el-radio-group v-model="form.shape" disabled>
						<el-radio :value="0">{{ t('zone.shapePolygon') }}</el-radio>
						<el-radio :value="1">{{ t('zone.shapeCircle') }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-if="form.shape === 1" :label="t('zone.form.radius')">
					<el-input-number v-model="form.radius" :min="10" :step="10" controls-position="right" style="width: 100%" />
				</el-form-item>
				<el-form-item :label="t('zone.form.height')">
					<div class="flex w-full items-center gap-2">
						<el-input-number v-model="form.minHeight" :min="0" controls-position="right" style="flex: 1" />
						<span class="c-gray">~</span>
						<el-input-number v-model="form.maxHeight" :min="1" controls-position="right" style="flex: 1" />
					</div>
				</el-form-item>
				<el-form-item :label="t('zone.form.color')">
					<el-color-picker v-model="form.color" />
				</el-form-item>
				<el-form-item :label="t('zone.form.enabled')">
					<el-switch v-model="form.isEnabled" />
				</el-form-item>
				<el-form-item :label="t('zone.form.remark')">
					<el-input v-model="form.remark" type="textarea" :rows="2" maxlength="512" />
				</el-form-item>
			</el-form>

			<div class="mt-2 rounded bg-gray-50 px-3 py-2 text-xs c-gray">
				<div>{{ t('zone.form.vertexCount') }}：{{ draftPoints.length }}</div>
				<div>{{ t('zone.form.area') }}：{{ formatSize(draftMetrics.area) }}</div>
				<div>{{ t('zone.form.perimeter') }}：{{ draftMetrics.perimeter.toFixed(1) }} m</div>
			</div>

			<template #footer>
				<div class="flex items-center justify-between">
					<el-popconfirm :title="t('zone.form.deleteConfirm')" @confirm="removeRow">
						<template #reference>
							<el-button v-if="editing" type="danger" plain icon="ele-Delete">{{ t('zone.form.delete') }}</el-button>
						</template>
					</el-popconfirm>
					<div class="ml-auto flex gap-2">
						<el-button @click="formVisible = false">{{ t('zone.form.cancel') }}</el-button>
						<el-button type="primary" :loading="submitting" @click="submitForm">{{ t('zone.form.save') }}</el-button>
					</div>
				</div>
			</template>
		</el-drawer>

		<!-- 导出 -->
		<el-dialog v-model="exportVisible" :title="t('zone.export.title')" width="820px">
			<el-alert v-if="exportResult?.validations?.some((v: any) => !v.valid)" type="warning" :closable="false" show-icon class="mb10">
				<template #title>
					<div class="text-xs">
						<div>{{ t('zone.export.hasInvalid') }}</div>
						<div v-for="v in exportResult.validations.filter((v: any) => !v.valid)" :key="v.areaId" class="c-danger">
							· {{ v.zoneName }}：{{ v.message }}
						</div>
					</div>
				</template>
			</el-alert>

			<div class="mb-2 flex items-center justify-between text-xs c-gray">
				<span>{{ t('zone.export.count') }}：{{ exportResult?.count ?? 0 }} / {{ exportResult?.validations?.length ?? 0 }}</span>
				<el-button size="small" icon="ele-DocumentCopy" @click="copyContent">{{ t('zone.export.copy') }}</el-button>
			</div>

			<el-input v-model="exportResult.content" type="textarea" :rows="18" readonly class="font-mono text-xs" />

			<template #footer>
				<div class="flex items-center">
					<span class="text-xs c-gray">{{ t('zone.export.hint') }}</span>
					<el-button class="ml-auto" @click="exportVisible = false">{{ t('zone.form.cancel') }}</el-button>
					<el-button type="primary" icon="ele-Download" @click="downloadFile">{{ t('zone.export.download') }}</el-button>
				</div>
			</template>
		</el-dialog>

		<!-- 登记文件（沿用原有能力） -->
		<el-dialog v-model="registerVisible" :title="t('zone.file.register')" width="620px" @closed="resetRegister">
			<el-form :model="registerForm" label-width="120">
				<el-form-item :label="t('zone.file.dock')">
					<el-select v-model="registerForm.dockSn" filterable :placeholder="t('zone.file.pickDock')" style="width: 100%">
						<el-option v-for="dock in fileDocks" :key="dock.sn" :label="dock.label" :value="dock.sn" />
					</el-select>
				</el-form-item>
				<el-form-item :label="t('zone.file.name')">
					<el-input v-model="registerForm.fileName" placeholder="geofence_park.json" />
				</el-form-item>
				<el-form-item :label="t('zone.file.objKey')">
					<el-input v-model="registerForm.objectKey" :placeholder="t('zone.file.objKeyTip')" />
				</el-form-item>
				<el-form-item :label="t('zone.file.syncNow')">
					<el-checkbox v-model="registerForm.syncImmediately" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="registerVisible = false">{{ t('zone.form.cancel') }}</el-button>
				<el-button type="primary" :loading="submitting" @click="submitRegister">{{ t('zone.form.save') }}</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="djiFlightArea">
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { deleteDjiFlightArea, dockOptionsDjiFlightArea, pageDjiFlightArea, registerDjiFlightArea, syncStatusOptionsDjiFlightArea, updateDjiFlightArea } from '/@/api/main/djiFlightArea';
import { addDjiFlyZone, deleteDjiFlyZone, exportDjiFlyZone, listDjiFlyZone, setEnabledDjiFlyZone, updateDjiFlyZone } from '/@/api/main/djiFlyZone';
import { useWorkspaceStore } from '/@/stores/useWorkspaceStore';
import { initCesium } from '/@/utils/cesium';
import * as ZC from '/@/utils/cesium/flyZone';
import { formatDate } from '/@/utils/formatTime';
import workspaceSelect from '/@/views/component/workspaceSelect.vue';

/**
 * 文案表。
 *
 * 本项目现有业务页都直接写中文，这里收敛成 key → 中文的映射：
 * 既保持与原项目一致的观感，又让把 t 换成真正的 vue-i18n 只需改这一个函数。
 * 后续若要国际化，把 ZH 换成语言包、t 换成 i18n.t 即可，模板无需改动。
 */
const ZH: Record<string, string> = {
	'zone.tab.map': '地图绘制',
	'zone.tab.file': '下发文件台账',
	'zone.mapLoading': '地图加载中，请稍候…',
	'zone.mapNotReady': '地图尚未就绪，请稍候再试',
	'zone.empty': '暂无区域，点上方按钮开始绘制',
	'zone.typeCustom': '作业区（圈内可飞）',
	'zone.typeNoFly': '禁飞区（圈外可飞）',
	'zone.shapePolygon': '多边形',
	'zone.shapeCircle': '圆形',

	'zone.draw.polygon': '画多边形',
	'zone.draw.circle': '画圆',
	'zone.draw.finish': '完成',
	'zone.draw.undo': '退一点',
	'zone.draw.cancel': '取消',
	'zone.draw.tipPolygon': '左键连续点选顶点，点「完成」结束（至少 3 点）',
	'zone.draw.tipCircle': '左键点选圆心，再点一次确定半径（≥10m）',
	'zone.draw.pointCount': '个点',
	'zone.draw.needThree': '多边形至少需要 3 个顶点',

	'zone.form.edit': '编辑区域',
	'zone.form.create': '新建区域',
	'zone.form.tip': '限高与颜色是平台侧的辅助信息，不影响下发到设备的文件内容。',
	'zone.form.name': '名称',
	'zone.form.type': '类型',
	'zone.form.shape': '形状',
	'zone.form.radius': '半径(m)',
	'zone.form.height': '限高(m)',
	'zone.form.color': '颜色',
	'zone.form.enabled': '启用',
	'zone.form.remark': '备注',
	'zone.form.vertexCount': '顶点数',
	'zone.form.area': '面积',
	'zone.form.perimeter': '周长',
	'zone.form.delete': '删除',
	'zone.form.deleteConfirm': '确定删除该区域吗？',
	'zone.form.cancel': '取消',
	'zone.form.save': '保存',
	'zone.form.saved': '保存成功',
	'zone.form.deleted': '删除成功',
	'zone.form.needName': '请填写区域名称',
	'zone.form.needGeometry': '缺少几何数据，请重新绘制',
	'zone.form.radiusMin': '圆形半径不得小于 10 米',
	'zone.form.needWorkspace': '请先选择工作空间',

	'zone.export.title': '导出下发文件',
	'zone.export.hasInvalid': '以下区域不符合设备协议要求，未被写入文件：',
	'zone.export.count': '已写入',
	'zone.export.copy': '复制内容',
	'zone.export.copied': '已复制到剪贴板',
	'zone.export.copyFailed': '复制失败，请手动选择文本',
	'zone.export.download': '下载 JSON',
	'zone.export.downloaded': '文件已下载',
	'zone.export.hint': '拿到文件后：上传到对象存储 → 到「下发文件台账」登记到目标机场 → 设备异步拉取生效。',

	'zone.file.workspace': '空间',
	'zone.file.dock': '机场',
	'zone.file.all': '全部机场',
	'zone.file.query': '查询',
	'zone.file.reset': '重置',
	'zone.file.register': '登记飞行区文件',
	'zone.file.notify': '通知设备同步',
	'zone.file.delete': '删除记录',
	'zone.file.tip': '这条链路是设备驱动的：云端登记 → 下发同步通知 → 设备自己来要文件地址 → 下载启用 → 上报进度。因此「已下发」不等于「已生效」，真值只能看列表里的同步状态。',
	'zone.file.name': '文件名',
	'zone.file.active': '启用中',
	'zone.file.enabled': '启用',
	'zone.file.history': '历史版本',
	'zone.file.syncStatus': '同步状态',
	'zone.file.failReason': '失败原因',
	'zone.file.size': '大小',
	'zone.file.checksum': 'SHA256',
	'zone.file.lastSync': '最近同步',
	'zone.file.pickDock': '请选择机场',
	'zone.file.needName': '请填写文件名',
	'zone.file.needKey': '请填写对象存储地址',
	'zone.file.objKey': '对象地址',
	'zone.file.objKeyTip': '对象存储 Key，或上传后拿到的完整 URL',
	'zone.file.syncNow': '登记后立即下发同步通知',
	'zone.file.notifyTitle': '下发确认',
	'zone.file.notifyConfirm': '确定通知【{name}】重新拉取并启用飞行区文件吗？设备会重新加载作业区域。',
	'zone.file.confirmSend': '确认下发',
	'zone.file.notified': '已下发同步通知',
	'zone.file.deleteTitle': '删除确认',
	'zone.file.deleteConfirm': '确定删除选中的 {n} 条记录吗？只删记录、不删对象存储里的文件。',
	'zone.file.confirmDelete': '确定删除',
};

/** 取文案，支持 {xxx} 占位符 */
function t(key: string, params?: Record<string, any>): string {
	let text = ZH[key] ?? key;
	if (params) {
		Object.keys(params).forEach((k) => {
			text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k]));
		});
	}
	return text;
}

const activeTab = ref('map');
const mapLoading = ref(false);
const zones = ref<any[]>([]);
const selectedId = ref<number | null>(null);
const queryWorkspaceId = ref<string>('');

/**
 * 工作空间选择器默认是「空 = 全部」，便于跨空间查看；但保存必须有明确归属
 * （后端 dji_fly_zone.workspace_id 是 NOT NULL）。进页面时先落到当前用户的默认空间，
 * 免得用户画完一片区域才发现存不进去。
 */
async function ensureWorkspace() {
	if (queryWorkspaceId.value) return;
	const mine = (await useWorkspaceStore().getMySpaces(true)) ?? [];
	const def = mine.find((x: any) => x.isDefault) ?? mine[0];
	if (def?.workspaceId) queryWorkspaceId.value = def.workspaceId.toString();
}

/** 当前绘制模式；null 表示不在绘制中 */
const drawing = ref<'polygon' | 'circle' | null>(null);

// ------------------------------------------------------------------ 地图绘制

// Cesium 的 viewer 是全局单例：同容器切 tab 回来不应重建，否则地形与视角会丢。
// 但如果是从别的 Cesium 页面跳过来的，旧的 viewer 绑在一个已经从 DOM 移除的容器上，
// 继续复用会得到一个空白地图 —— 这种情况必须销毁重建。
async function ensureViewer() {
	const el = document.getElementById('cesiumContainer');
	if (!el) return;

	const exist = (window as any).viewer;
	if (exist) {
		if (exist.container === el) return;
		try {
			exist.destroy?.();
		} catch (e) {
			console.warn('[flyzone] 销毁旧 viewer 失败：', e);
		}
		(window as any).viewer = undefined;
	}

	mapLoading.value = true;
	try {
		// 明确传容器元素：页面里可能同时存在 id 相同的残留节点，避免初始化挂错容器。
		// 本页自己接管左键拾取（绘制），关掉全局默认的点击行为。
		await initCesium({ container: el, bindDefaultClick: false });
	} finally {
		mapLoading.value = false;
	}
}

function colorFor(zoneType: number) {
	return ZC.DEFAULT_COLORS[zoneType] ?? ZC.DEFAULT_COLORS[0];
}

function renderAll() {
	ZC.clearZones();
	zones.value.forEach((z) => ZC.renderZone(z));
}

async function loadZones() {
	const res = await listDjiFlyZone(queryWorkspaceId.value || undefined);
	zones.value = res.data.result ?? [];
	renderAll();
}

function beginDraw(mode: 'polygon' | 'circle') {
	if (!(window as any).viewer) {
		ElMessage.warning(t('zone.mapNotReady'));
		return;
	}
	ZC.stopDraw();
	// 圆形由「点圆心 → 点半径」两次点击自动完成，会走到 onFinish；
	// 多边形则必须等用户点「完成」，避免双击带来的重复顶点问题。
	ZC.startDraw(mode, (points, radius) => {
		drawing.value = null;
		openForm(points, radius);
	});
	drawing.value = mode;
}

function finishDraw() {
	const draft = ZC.commitDraw();
	if (!draft) return ElMessage.warning(t('zone.draw.needThree'));
	drawing.value = null;
	openForm(draft.points, draft.radius);
}

function undoPointDraw() {
	ZC.undoPoint();
	draftPoints.value = ZC.getDraftPoints();
}

function cancelDraw() {
	ZC.stopDraw();
	drawing.value = null;
}

const draftPoints = ref<[number, number][]>([]);
const draftMetrics = computed(() =>
	ZC.measure(draftPoints.value, form.shape === 1 ? 1 : 0, form.radius ?? 0)
);

function selectRow(row: any) {
	selectedId.value = row.id;
	ZC.flyToZone(row.id);
}

async function toggleEnable(row: any, value: boolean) {
	row.isEnabled = value;
	try {
		await setEnabledDjiFlyZone([row.id], value);
		renderAll();
	} catch {
		row.isEnabled = !value;
	}
}

// ------------------------------------------------------------------ 属性表单

const formVisible = ref(false);
const submitting = ref(false);
const editing = ref(false);

const form = reactive({
	id: undefined as number | undefined,
	workspaceId: '',
	name: '',
	zoneType: 0,
	shape: 0,
	radius: 100,
	minHeight: 0,
	maxHeight: 120,
	color: '',
	isEnabled: true,
	remark: '',
	sort: 0,
});

function openForm(points: [number, number][], radius: number) {
	draftPoints.value = points;
	editing.value = false;
	Object.assign(form, {
		id: undefined,
		workspaceId: queryWorkspaceId.value,
		name: '',
		zoneType: 0,
		shape: radius > 0 ? 1 : 0,
		radius: Math.max(radius, 10),
		minHeight: 0,
		maxHeight: 120,
		color: '',
		isEnabled: true,
		remark: '',
		sort: 0,
	});
	formVisible.value = true;
}

/** 编辑已有区域：从列表进入，几何直接取自后端返回的串 */
function editRow(row: any) {
	editing.value = true;
	draftPoints.value = ZC.parseRing(row.geometry);
	Object.assign(form, {
		id: row.id,
		workspaceId: row.workspaceId,
		name: row.name,
		zoneType: row.zoneType,
		shape: row.shape,
		radius: Math.max(row.radius || 10, 10),
		minHeight: row.minHeight ?? 0,
		maxHeight: row.maxHeight ?? 120,
		color: row.color || '',
		isEnabled: row.isEnabled,
		remark: row.remark || '',
		sort: row.sort ?? 0,
	});
	formVisible.value = true;
}

function resetForm() {
	draftPoints.value = [];
}

async function submitForm() {
	// 后端 workspace_id 是 NOT NULL，这里提前拦一道，避免用户画完才发现存不进去
	if (!queryWorkspaceId.value) return ElMessage.warning(t('zone.form.needWorkspace'));
	if (!form.name.trim()) return ElMessage.warning(t('zone.form.needName'));
	if (!draftPoints.value.length) return ElMessage.warning(t('zone.form.needGeometry'));
	if (form.shape === 1 && (form.radius ?? 0) < 10) return ElMessage.warning(t('zone.form.radiusMin'));

	submitting.value = true;
	try {
		const payload = {
			workspaceId: queryWorkspaceId.value || undefined,
			name: form.name.trim(),
			zoneType: form.zoneType,
			shape: form.shape,
			geometry: {
				type: (form.shape === 1 ? 'Point' : 'Polygon') as 'Point' | 'Polygon',
				coordinates: form.shape === 1 ? [draftPoints.value[0]] : draftPoints.value,
			},
			radius: form.shape === 1 ? form.radius : 0,
			minHeight: form.minHeight,
			maxHeight: form.maxHeight,
			color: form.color || undefined,
			isEnabled: form.isEnabled,
			sort: form.sort,
			remark: form.remark || undefined,
		};

		if (editing.value && form.id) await updateDjiFlyZone({ ...payload, id: form.id });
		else await addDjiFlyZone(payload);

		ElMessage.success(t('zone.form.saved'));
		formVisible.value = false;
		await loadZones();
	} finally {
		submitting.value = false;
	}
}

async function removeRow() {
	if (!form.id) return;
	await deleteDjiFlyZone([form.id]);
	ElMessage.success(t('zone.form.deleted'));
	formVisible.value = false;
	await loadZones();
}

/** 列表项直接删除（用于清理旧格式/异常记录，无需先打开表单） */
async function removeZoneRow(row: any) {
	await ElMessageBox.confirm(t('zone.form.deleteConfirm'), t('zone.form.delete'), {
		type: 'warning',
		confirmButtonText: t('zone.form.delete'),
		cancelButtonText: t('zone.form.cancel'),
	});
	await deleteDjiFlyZone([row.id]);
	ElMessage.success(t('zone.form.deleted'));
	if (selectedId.value === row.id) selectedId.value = null;
	await loadZones();
}

// ------------------------------------------------------------------ 导出

const exportVisible = ref(false);
const exportResult = ref<any>(null);

async function openExport() {
	const res = await exportDjiFlyZone(queryWorkspaceId.value || undefined);
	exportResult.value = res.data.result;
	exportVisible.value = true;
}

function downloadFile() {
	const blob = new Blob([exportResult.value?.content ?? ''], { type: 'application/json' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = exportResult.value?.fileName ?? 'geofence.json';
	a.click();
	URL.revokeObjectURL(a.href);
	ElMessage.success(t('zone.export.downloaded'));
}

function copyContent() {
	navigator.clipboard?.writeText(exportResult.value?.content ?? '').then(
		() => ElMessage.success(t('zone.export.copied')),
		() => ElMessage.warning(t('zone.export.copyFailed'))
	);
}

// ------------------------------------------------------------------ 文件台账（原有能力）

const fileQuery = ref<any>({});
const fileParams = ref({ page: 1, pageSize: 20, total: 0 });
const fileRows = ref<any[]>([]);
const fileLoading = ref(false);
const fileSelection = ref<any[]>([]);
const fileDocks = ref<any[]>([]);
const syncStatusOptions = ref<any[]>([]);
const registerVisible = ref(false);
const registerForm = ref<any>({ dockSn: '', fileName: '', objectKey: '', syncImmediately: true });

async function loadFileDocks(workspaceId?: string) {
	const res = await dockOptionsDjiFlightArea(workspaceId || fileQuery.value.workspaceId);
	fileDocks.value = res.data.result ?? [];
}

async function loadFiles() {
	fileLoading.value = true;
	try {
		const res = await pageDjiFlightArea(Object.assign({}, fileQuery.value, fileParams.value));
		fileRows.value = res.data.result?.items ?? [];
		fileParams.value.total = res.data.result?.total ?? 0;
	} finally {
		fileLoading.value = false;
	}
}

function handleFileWorkspaceChange() {
	fileQuery.value.dockSn = undefined;
	fileParams.value.page = 1;
	loadFileDocks(fileQuery.value.workspaceId);
	loadFiles();
}

function resetFileQuery() {
	fileQuery.value = {};
	fileParams.value.page = 1;
	loadFileDocks();
	loadFiles();
}

function handleWorkspaceChange() {
	zones.value = [];
	selectedId.value = null;
	loadZones();
}

function openRegister() {
	registerVisible.value = true;
	if (!registerForm.value.dockSn && fileDocks.value.length === 1) registerForm.value.dockSn = fileDocks.value[0].sn;
}

function resetRegister() {
	registerForm.value = { dockSn: '', fileName: '', objectKey: '', syncImmediately: true };
}

async function submitRegister() {
	if (!registerForm.value.dockSn) return ElMessage.warning(t('zone.file.pickDock'));
	if (!registerForm.value.fileName) return ElMessage.warning(t('zone.file.needName'));
	if (!registerForm.value.objectKey) return ElMessage.warning(t('zone.file.needKey'));
	submitting.value = true;
	try {
		await registerDjiFlightArea(registerForm.value);
		ElMessage.success(t('zone.form.saved'));
		registerVisible.value = false;
		await loadFiles();
	} finally {
		submitting.value = false;
	}
}

async function handleNotify() {
	if (fileSelection.value.length !== 1) return;
	const row = fileSelection.value[0];
	await ElMessageBox.confirm(t('zone.file.notifyConfirm', { name: row.dockNick || row.dockSn }), t('zone.file.notifyTitle'), {
		type: 'warning',
		confirmButtonText: t('zone.file.confirmSend'),
		cancelButtonText: t('zone.form.cancel'),
	});
	await updateDjiFlightArea({ dockSn: row.dockSn, confirm: true });
	ElMessage.success(t('zone.file.notified'));
	await loadFiles();
}

async function handleFileDelete() {
	if (!fileSelection.value.length) return;
	await ElMessageBox.confirm(t('zone.file.deleteConfirm', { n: fileSelection.value.length }), t('zone.file.deleteTitle'), {
		type: 'warning',
		confirmButtonText: t('zone.file.confirmDelete'),
		cancelButtonText: t('zone.form.cancel'),
	});
	await deleteDjiFlightArea(fileSelection.value.map((m) => m.id));
	ElMessage.success(t('zone.form.deleted'));
	await loadFiles();
}

// ------------------------------------------------------------------ 展示辅助

function formatSize(v?: number) {
	if (!v) return '-';
	if (v >= 1e6) return `${(v / 1e6).toFixed(2)} km²`;
	return `${v.toFixed(0)} m²`;
}
function formatArea(row: any) {
	return row.shape === 1 ? `r=${(row.radius ?? 0).toFixed(0)}m` : formatSize(row.areaSquareMeters);
}
function formatDateTime(value?: string) {
	return value ? formatDate(new Date(value), 'YYYY-mm-dd HH:MM:SS') : '';
}
function shortDigest(checksum?: string) {
	if (!checksum) return '-';
	return checksum.length <= 16 ? checksum : `${checksum.slice(0, 8)}…${checksum.slice(-4)}`;
}
function syncTagType(status: number) {
	if (status === 2) return 'success';
	if (status === 1) return 'primary';
	if (status === 0) return 'info';
	return 'danger';
}

onMounted(async () => {
	await nextTick();
	// 地图初始化失败不应该把列表数据一起拖死，这里吞掉异常只记日志
	try {
		await ensureViewer();
	} catch (e) {
		console.error('[flyzone] Cesium 初始化失败：', e);
	}
	// 先定工作空间再拉列表：空着拉会拿到跨空间的全部区域，与「保存时的归属」不一致
	await ensureWorkspace();
	await Promise.all([loadZones(), loadFileDocks(), loadFiles()]);
	// 后端字典用于同步状态染色
	try {
		const res = await syncStatusOptionsDjiFlightArea();
		syncStatusOptions.value = res.data.result ?? [];
	} catch {
		syncStatusOptions.value = [];
	}
});

onUnmounted(() => {
	ZC.stopDraw();
	// 只清本图层实体；viewer 本身留给其它页面复用
	ZC.clearZones();
});
</script>

<style scoped>
.flyzone-page {
	height: 100%;
}
.map-layout {
	display: flex;
	gap: 8px;
	height: calc(100vh - 190px);
	min-height: 520px;
}
.zone-panel {
	display: flex;
	flex-direction: column;
	width: 280px;
	flex: 0 0 280px;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 6px;
	background: var(--el-bg-color);
	overflow: hidden;
}
.panel-head {
	padding: 8px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}
.toolbar {
	padding: 8px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}
.draw-tip {
	padding: 6px 8px;
	font-size: 11px;
	color: var(--el-text-color-secondary);
	background: var(--el-color-primary-light-9);
}
.zone-list {
	flex: 1;
	padding: 4px;
}
.zone-item {
	position: relative;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 8px;
	border-radius: 6px;
	cursor: pointer;
	transition: background 0.15s;
}
.zone-del {
	opacity: 0;
	margin: 0;
	padding: 2px;
	transition: opacity 0.15s;
}
.zone-item:hover .zone-del {
	opacity: 1;
}
.zone-item:hover {
	background: var(--el-fill-color-light);
}
.zone-item.active {
	background: var(--el-color-primary-light-9);
}
.zone-item.muted {
	opacity: 0.5;
}
.zone-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	flex: 0 0 10px;
}
.panel-foot {
	padding: 8px;
	border-top: 1px solid var(--el-border-color-lighter);
}
.map-wrap {
	position: relative;
	flex: 1;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 6px;
	overflow: hidden;
}
.map-mask {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.35);
	color: #fff;
	font-size: 13px;
}
.c-gray {
	color: var(--el-text-color-secondary);
}
.c-danger {
	color: var(--el-color-danger);
}
.c-brand {
	color: var(--el-color-primary);
	font-weight: 600;
}
</style>

<style>
/* Cesium 容器是全局固定 id，只能非 scoped 覆盖 */
.flyzone-page #cesiumContainer {
	width: 100%;
	height: 100%;
}
.flyzone-page .cesium-viewer-bottom {
	display: none;
}
</style>
