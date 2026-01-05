<template>
	<div
		class="card group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:accent-blue active:scale-[1.00] active:shadow-xl flex flex-col items-center border-1 border-solid border-gray-200 hover:border-blue-400 p-2"
		:class="{ ' bg-blue-700 border-0 color-white': selected }"
		:style="cardStyle"
		@click="emit('click', { title, description })"
	>
		<!-- 图片区域 -->
		<div class="overflow-hidden pt-2">
			<SvgIcon :name="image" :size="imageSize" />
		</div>
		<!-- 文字区域 -->
		<div>
			<h3 class="font-semibold truncate" v-if="title">{{ title }}</h3>
			<p class="mt-1 text-sm line-clamp-2" v-if="description">{{ description }}</p>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	selected: { type: Boolean, default: false },
	image: { type: String, required: true },
	cardStyle: { type: String },
	imageSize: { type: Number, default: 46 },
	title: { type: String },
	description: { type: String, default: '' },
});

const emit = defineEmits(['click']);
</script>
