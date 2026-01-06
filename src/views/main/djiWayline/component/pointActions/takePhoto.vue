<template>
	<div class="mt-2 p-2 flex flex-col gap-4">
		<div class="flex justify-between flex-wrap">
			<div>DJI_YYYYMMDDhhmm_XXX_</div>
			<div v-if="!isEdit" class="i-material-symbols:edit cursor-pointer" @click="isEdit = true"></div>
		</div>
		<div v-if="isEdit" class="flex justify-between">
			<div class="flex-1">
				<el-input placeholder="请输入文件名" v-model="params.directoryName"> </el-input>
			</div>
			<div class="flex items-center gap-2 ml-2">
				<el-icon class="cursor-pointer c-green hover:op-70" @click="console.log(111)">
					<Check></Check>
				</el-icon>
				<el-icon class="cursor-pointer c-rose hover:op-70" @click="isEdit = false">
					<Close></Close>
				</el-icon>
			</div>
		</div>
		<div class="flex justify-between">
			<div>
				<!-- 按钮多选框 -->
				<el-checkbox-group :disabled="params.useGlobalPayloadLensIndex" v-model="photoTypes">
					<el-checkbox-button value="visable" label="可见光"></el-checkbox-button>
					<el-checkbox-button value="ir" label="红外"></el-checkbox-button>
				</el-checkbox-group>
			</div>
			<el-button @click="params.useGlobalPayloadLensIndex = !params.useGlobalPayloadLensIndex" :type="params.useGlobalPayloadLensIndex ? 'primary' : 'default'">使用全局设置</el-button>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue';
import { reactive, ref } from 'vue';

const isEdit = ref(false);
var photoTypes = ref(['visable', 'ir']);
const params = reactive({ directoryName: '', useGlobalPayloadLensIndex: true });
</script>
<script setup lang="ts"></script>

<style scoped></style>
