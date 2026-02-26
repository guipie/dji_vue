<template>
	<div class="relative w-32 h-32 rounded-full border-solid border-2 border-gray-600">
		<!-- 方向文字 -->
		<div class="absolute top-2 left-1/2 -translate-x-1/2 text-lg font-bold">N</div>
		<div class="absolute bottom-2 left-1/2 -translate-x-1/2 text-lg font-bold">S</div>
		<div class="absolute left-2 top-1/2 -translate-y-1/2 text-lg font-bold">W</div>
		<div class="absolute right-2 top-1/2 -translate-y-1/2 text-lg font-bold">E</div>

		<!-- 带箭头的指北针 -->
		<div
			class="absolute origin-bottom"
			:style="{
				top: '50%',
				left: '50%',
				transform: `translate(-50%, -100%) rotate(${angle}deg)`,
				width: '2px',
				height: '22px',
			}"
		>
			<!-- 箭杆 -->
			<div class="w-full h-full bg-red-500"></div>
			<!-- 箭头（三角形） -->
			<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0" style="border-left: 3px solid transparent; border-right: 3px solid transparent; border-bottom: 4px solid #ef4444"></div>
		</div>

		<!-- 中心圆点 -->
		<div class="absolute top-1/2 left-1/2 w-3 h-3 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
	</div>
</template>

<script setup>
defineProps({
	angle: {
		type: Number,
		default: 0, // 0° = 北，90° = 东
	},
});
</script>
