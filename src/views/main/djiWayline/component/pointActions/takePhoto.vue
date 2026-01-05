<template>
	<div>
		<el-input v-model="takePhotoParams.directoryName" placeholder="">
			<template #prepend>DJI_YYYYMMDDhhmm_XXX_</template>
			<template #append>
				<div v-if="isEdit">
					<el-icon @click="isEdit = false"><Edit /></el-icon>
				</div>
				<div v-else>
					<el-icon @click="isEdit = true"><Check /></el-icon>
				</div>
			</template>
		</el-input>
	</div>
</template>
<script lang="ts">
import { Edit } from '@element-plus/icons-vue';
import { ref } from 'vue';
const isEdit = ref(false);
const takePhotoParams = ref({ directoryName: '' });
</script>
<script setup lang="ts"></script>

<style scoped></style>
