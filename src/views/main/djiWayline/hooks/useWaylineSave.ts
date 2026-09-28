import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useWaylineStore } from '/@/stores/useWaylineStore';
import { createDjiWayline, updateDjiWayline } from '/@/api/main/djiWayline';
import type { WaylineSubmitParams } from '/@/types/wayline/waylineCreate';

/**
 * 航线保存逻辑
 * @description 编辑器（create.vue）与创建弹框共用：
 * 有 id 走更新，无 id 走新增；后端会在保存时重新生成并上传 KMZ。
 */
export function useWaylineSave() {
	const waylineStore = useWaylineStore();
	const saving = ref(false);

	/**
	 * 保存前校验
	 * @description 与后端 ValidateRequest 规则保持一致，尽量在前端给出更友好的提示
	 * @returns 错误提示文案，校验通过返回空字符串
	 */
	function validate(): string {
		const { curCreateWayline } = waylineStore;
		if (!curCreateWayline.waylineName?.trim()) return '请填写航线名称';
		if (!curCreateWayline.domainTypeSubType) return '请选择飞行器';
		if (!(curCreateWayline.folder?.placemarks?.length ?? 0)) return '请至少添加一个航点';
		return '';
	}

	/**
	 * 组装提交给后端的完整载荷
	 * @description 深拷贝以剥离 Vue 响应式代理与 undefined 字段
	 */
	function buildPayload(): WaylineSubmitParams {
		const payload = JSON.parse(JSON.stringify(waylineStore.$state.curCreateWayline));
		payload.ext = JSON.parse(JSON.stringify(waylineStore.$state.curCreateWaylineExt));
		return payload as WaylineSubmitParams;
	}

	/**
	 * 保存航线
	 * @param silent 为 true 时不弹出成功提示（供自动保存等场景使用）
	 * @returns 航线Id；校验不通过或保存失败时返回 null
	 */
	async function saveWayline(silent = false): Promise<number | null> {
		const message = validate();
		if (message) {
			ElMessage.warning(message);
			return null;
		}
		saving.value = true;
		try {
			const payload = buildPayload();
			const isUpdate = !!payload.id;
			const res = isUpdate ? await updateDjiWayline(payload) : await createDjiWayline(payload);
			const id = payload.id ?? Number(res.data?.result);
			if (!id) return null;
			// 落库后回写 Id，后续保存自动转为更新
			waylineStore.curCreateWayline.id = id;
			if (!silent) ElMessage.success(isUpdate ? '保存成功' : '创建成功');
			return id;
		} catch (error) {
			// 请求拦截器已统一提示错误，这里只需要阻止后续流程
			console.error('保存航线失败：', error);
			return null;
		} finally {
			saving.value = false;
		}
	}

	return { saving, validate, buildPayload, saveWayline };
}
